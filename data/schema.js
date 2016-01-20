import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

import {
  globalIdField,
  fromGlobalId,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray,
  mutationWithClientMutationId
} from "graphql-relay";

let Schema = (db) => {
  class Store {}
  let store = new Store();

  let nodeDefs = nodeDefinitions(
    (globalId) => {
      let {type} = fromGlobalId(globalId);
      if (type === 'Store') {
        return store
      }
      return null;
    },
    (obj) => {
      if (obj instanceof Store) {
        return storeType;
      }
      return null;
    }
  );

  
  let linkType = new GraphQLObjectType({
    name: 'Link',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: (obj) => obj._id
      },
      title: { type: GraphQLString },
      url: { type: GraphQLString },
      email:{type:GraphQLString},
      password:{type:GraphQLString},
      createdAt: {
        type: GraphQLString,
        resolve: (obj) => new Date(obj.createdAt).toISOString()
      }
    })
  });

  let linkConnection = connectionDefinitions({
    name: 'Link',
    nodeType: linkType
  });
  let storeType = new GraphQLObjectType({
    name: 'Store',
    fields: () => ({
      id: globalIdField("Store"),
      linkConnection: {
        type: linkConnection.connectionType,
        args: {
          ...connectionArgs,
          query: { type: GraphQLString },
          email: { type: GraphQLString },
          password: { type: GraphQLString }
        },
        resolve: (_, args) => {
          let findParams = {};
          if (args.query) {
            findParams.title = new RegExp(args.query, 'i');
          }
          if (!args.limit || args.limit > 200) {
            args.limit = 100
          }
          return connectionFromPromisedArray(
            db.collection("links")
              .find(findParams)
              .sort({createdAt: -1})
              .limit(args.first).toArray(),
            args
          );
        }
      }
    }),
    interfaces: [nodeDefs.nodeInterface]
  });


  let createLinkMutation = mutationWithClientMutationId({
    name: 'CreateLink',

    inputFields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      url: { type: new GraphQLNonNull(GraphQLString) },
      email:{type: new GraphQLNonNull(GraphQLString)},
      password:{type: new GraphQLNonNull(GraphQLString)}
    },

    outputFields: {
      linkEdge: {
        type: linkConnection.edgeType,
        resolve: (obj) => ({ node: obj.ops[0], cursor: obj.insertedId })
      },
      store: {
        type: storeType,
        resolve: () => store
      }
    },

    mutateAndGetPayload: ({title, url,email,password}) => {
      return db.collection("links").insertOne({
        title,
        url,
        email,
        password,
         createdAt: Date.now(),
       
      });
    }
  });

  let schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        node: nodeDefs.nodeField,
        store: {
          type: storeType,
          resolve: () => store
        }
      })
    }),

    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        createLink: createLinkMutation
      })
    })
  });

  return schema
};

export default Schema;
