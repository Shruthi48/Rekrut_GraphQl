import Relay from "react-relay";

class CreateLinkMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`
      mutation { createLink }
    `;
  }

  getVariables() {
    return {
      title: this.props.title,
      url: this.props.url,
      email:this.props.email,
      password:this.props.password,
    }
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateLinkPayload {
        linkEdge,
        store { linkConnection }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'store',
      parentID: this.props.store.id,
      connectionName: 'linkConnection',
      edgeName: 'linkEdge',
      rangeBehaviors: {
        '': 'prepend',
      },
    }]
  }

  getOptimisticResponse() {
    return {
      linkEdge: {
        node: {
          title: this.props.title,
          url: this.props.url,
          email:this.props.email,
          password:this.props.password
         
        }
      }
    }
  }
}

export default CreateLinkMutation;
