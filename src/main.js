import React from 'react';
import { render as reactDomReader } from 'react-dom';
import superagent from 'superagent';
import './style/main.scss';

const apiUrl = 'www.http://reddit.com/r';

class RedditSearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redditName: '',
    };

    this.handleRedditNameChange = this.handleRedditNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleRedditNameChange(event) {
    this.setState({ redditName: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.redditSelect(this.state.redditName);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
      <input
      type="text"
      name="redditName"
      placeholder="Search for an Article"
      value={this.state.redditName}
      onChange={this.handleRedditNameChange}
      />
      </form>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redditLookup: {},
      redditSelected: null,
      redditNameError: null,
    };

    this.redditSelect = this.redditSelect.bind(this);
    this.renderAbilitiesList = this.renderAbilitiesList.bind(this);
  }

  componentDidUpdate() {
    console.log('__UPDATE STATE__', this.state);
  }

  componentDidMount() {
    if (localStorage.redditLookup) {
      try {
        const redditLookup = JSON.parse(localStorage.redditLookup);
        return this.setState({ redditLookup });
      } catch (err) {
        return console.error(err);
      }
    } else {
      return superagent.get(apiUrl)
        .then((response) => {
          console.log(response);
          const redditLookup = response.body.results.reduce((dict, result) => {
            dict[result.name] = result.url;
            return dict;
          }, {});

          try {
            localStorage.redditLookup = JSON.stringify(redditLookup);
            this.setState({ redditLookup });
          } catch (err) {
            console.error(err);
          }
        })
        .catch(console.error);
    }
  }

  redditSelect(name) {
    if (!this.state.redditLookup[name]) {
      this.setState({
        redditSelected: null,
        redditNameError: name,
      });
    } else {
      return superagent.get(this.state.redditLookup[name])
        .then((response) => {
          this.setState({
            redditSelected: response.body,
            redditNameError: null,
          });
        })
        .catch(console.error);
    }
    return undefined;
  }

  renderAbilitiesList(reddit) {
    return (
      <ul>
        { reddit.abilities.map((item, index) => {
          return (
            <li key={index}>
            <p>{item.ability.name}</p>
            </li>
          );
        })}
        </ul>
    );
  }

  render() {
    return (
      <section>
        <h1>Reddit Form</h1>
        <RedditSearchForm
        redditSelect={this.redditSelect}
        />
        {
          this.state.redditNameError ?
          <div>
            <h2 className="error">
            { `"${this.state.redditNameError}"`}does not exist.
            Please make another request.
            </h2>
            </div> :
            <div>
              {
                this.state.redditSelected ?
                <div>
                  <div>
                    <img src={this.state.redditSelected.front_default} />
                    </div>
                    <h2>Selected: {this.state.redditSelected.name}</h2>
                    <h3>Abilities:</h3>
                    { this.renderAbilitiesList(this.state.redditSelected)}
                    </div> :
                    <div>
                      Please make a request to see a reddit article.
                      </div>
              }
              </div>
        }
        </section>
    );
  }
}

const container = document.createElement('div');
document.body.appendChild(container);

reactDomReader(<App />, container);
