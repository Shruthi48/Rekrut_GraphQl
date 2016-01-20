import React from "react";
import Relay from "react-relay";
import {debounce} from "lodash";

import Link from "./Link";
import CreateLinkMutation from "../mutations/CreateLinkMutation";

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.search = debounce(this.search, 300);
  }

  search = (e) => {
    let query = e.target.value;
    this.props.relay.setVariables({ query });
  };

  setLimit = (e) => {
    let newLimit = Number(e.target.value);
    this.props.relay.setVariables({limit: newLimit});
  };

  handleSubmit = (e) => {
    e.preventDefault();
    let email =this.refs.newEmail.value;
      this.props.relay.setVariables({email: email});
      console.log(email);
      let password=this.refs.newPassword.value;
      this.props.relay.setVariables({password: password});
      console.log(password);
    let onSuccess = () => {
      $('#modal').closeModal();
    };
    let onFailure = (transaction) => {
      var error = transaction.getError() || new Error('Mutation failed.');
      console.error(error);
    };
    Relay.Store.commitUpdate(

      new CreateLinkMutation({
        title: this.refs.newTitle.value,
        url: this.refs.newUrl.value,
        email:this.refs.newEmail.value,
        password:this.refs.newPassword.value,
        store: this.props.store
      }),
      {onFailure, onSuccess}
    );
    this.refs.newTitle.value = "";
    this.refs.newUrl.value = "";
    this.refs.newEmail.value="";
    this.refs.newPassword.value="";
  };

  componentDidMount() {
    $('.modal-trigger').leanModal();
    $(".button-collapse").sideNav();
  }

  render() {
    let content = this.props.store.linkConnection.edges.map(edge => {
      return <Link key={edge.node.id} link={edge.node} />;
    });
    return (
     
      <div>
       <nav>
    <div className="nav-wrapper light-blue">
      <a href="#!" className="brand-logo"><img src="rekrut1.png"></img></a>
      <a href="#" data-activates="mobile-demo" className="button-collapse"><i className="material-icons">menu</i></a>
      <ul className="right hide-on-med-and-down">
        <li><a href="#!">Sass</a></li>
        <li><a href="#!">Components</a></li>
        <li><a href="#!">Javascript</a></li>
        <li><a href="#!">Mobile</a></li>
        <li><a className="waves-effect waves-light btn modal-trigger right light-green white-text" href="#modal">Sign Up</a></li>
      </ul>
      <ul className="side-nav" id="mobile-demo">
        <li><a href="#!">Sass</a></li>
        <li><a href="#!">Components</a></li>
        <li><a href="#!">Javascript</a></li>
        <li><a href="#!">Mobile</a></li>
        <li><a className="waves-effect waves-light btn modal-trigger right light-green white-text" href="#modal">Sign Up</a></li>
      </ul>
    </div>
  </nav>
        <div className="input-field">
          <input id="search" type="text" onChange={this.search} />
          <label htmlFor="search">Search All Resources</label>
        </div>

        <div className="row">
          
        </div>

        <ul>
          {content}
        </ul>

        <div className="row">
          <div className="col m9 s12">
            <div className="flow-text">
             
            </div>
          </div>
          <div className="col m3 hide-on-small-only">
            <div className="input-field">
              <select id="showing" className="browser-default"
                onChange={this.setLimit} defaultValue={this.props.relay.variables.limit}>
                <option value="100">Show 100</option>
                <option value="200">Show 200</option>
              </select>
            </div>
          </div>
        </div>

        <div id="modal" className="modal modal-fixed-footer">
          <form onSubmit={this.handleSubmit}>
            <div className="modal-content">
              <h5>Sign Up</h5>
              <div className="input-field">
                <input type="text" id="newTitle" ref="newTitle" required className="validate" />
                <label htmlFor="newTitle">Name</label>
              </div>
              <div className="input-field">
                <input type="url" id="newUrl" ref="newUrl" required className="validate" />
                <label htmlFor="newUrl">Url</label>
              </div>
              <div className="input-field">
                <input type="email" id="newEmail" ref="newEmail" required className="validate" />
                <label htmlFor="newEmail">Email</label>
              </div>
               <div className="input-field">
                <input type="password" id="newPassword" ref="newPassword" required className="validate" />
                <label htmlFor="newPassword">Password</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="waves-effect waves-green btn-flat green darken-3 white-text">
                <strong>Done</strong>
              </button>
              <a href="#!" className="modal-action modal-close waves-effect waves-red btn-flat">Cancel</a>
            </div>
          </form>
        </div>

      </div>
    );
  }
}

// Declare the data requirement for this component
Main = Relay.createContainer(Main, {
  initialVariables: {
    limit: 100,
    query: '',
    email:'',
    password:'',
  },
  fragments: {
    store: () => Relay.QL`
      fragment on Store {
        id,
        linkConnection(first: $limit) {
          edges {
            node {
              id,
              
              ${Link.getFragment('link')},

            }
          }
        }
      }
    `
  }
});

export default Main;
