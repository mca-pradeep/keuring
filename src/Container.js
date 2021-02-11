import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";
import Network from "./services/network_service";
import "./assets/css/App.css";
import * as beverages_codes from "./language/codes/beverages/beverages";
import * as general_codes from "./language/codes/general/general";
import * as QueryString from "query-string";
import Header from "./components/header";
import Beverages from "./components/beverages";
import BeverageDetails from "./components/UI/beverage_details";
import Footer from "./UI/footer";
import { PATHS, effective_languages } from "./config/constants";
let defaultLanguage = localStorage.getItem("default_language");
if (
  defaultLanguage === null ||
  effective_languages.indexOf(defaultLanguage) === -1
) {
  defaultLanguage = "en";
  localStorage.setItem("default_language", defaultLanguage);
}
const general_messages = require(`./language/${defaultLanguage}/general/general`);
const beverages_messages = require(`./language/${defaultLanguage}/beverages/beverages`);

class Container extends Component {
  state = {
    language: defaultLanguage,
    general_messages: general_messages,
    beverages_messages: beverages_messages,
    general_codes: general_codes,
    beverages_codes: beverages_codes,
    beverages: [],
    brewerSecurityCode: null,
    brewerId: null,
    pod: null,
  };

  componentDidMount() {
    //do call api for getting available beverages
    let path = `${PATHS.BASE_PATH}${PATHS.RESERVE}`;
    const queryObjs = QueryString.parse(this.props.location.search);
    new Network(path, "POST", queryObjs)
      //new Network(`${window.location.origin}/keuring-reserve.json`, "GET")
      .hitNetwork()
      .then((resp) => {
        this.props.loader(false);
        localStorage.setItem("bever_list", JSON.stringify(resp));
        this.setState({
          brewerSecurityCode: resp.capabilities.brewerSecurityCode,
          brewerId: resp.capabilities.brewerId,
          pod: resp.capabilities.pod,
          beverages: resp.capabilities.beverageTypes,
        });
      })
      .catch((e) => this.props.loader(false));
    //do language specific things
    let defaultLanguage = localStorage.getItem("default_language");
    if (
      this.state.general_messages === null ||
      this.state.language !== defaultLanguage
    ) {
      if (
        defaultLanguage === null ||
        effective_languages.indexOf(defaultLanguage) === -1
      ) {
        defaultLanguage = "en";
        localStorage.setItem("default_language", defaultLanguage);
      }
      this.setState({
        general_messages: require(`./language/${defaultLanguage}/general/general`),
        beverages_messages: require(`./language/${defaultLanguage}/beverages/beverages`),
      });
    }
  }

  render() {
    let footer = null;
    if (this.state.is_footer) {
      footer = <Footer />;
    }

    return (
      <React.Fragment>
        <Switch>
          <Route path="/" exact>
            <Header
              loader={this.props.loader}
              pod={this.state.pod}
              beverage_codes={this.state.beverages_codes}
              beverage_messages={this.state.beverages_messages}
              is_back={false}
              is_footer={false}
            />
            <Beverages
              loader={this.props.loader}
              beverage_codes={this.state.beverages_codes}
              beverages={this.state.beverages}
              beverage_messages={this.state.beverages_messages}
            />
          </Route>
          <Route path="/beverage/:code" exact>
            <Header
              loader={this.props.loader}
              pod={this.state.pod}
              beverage_codes={this.state.beverages_codes}
              beverage_messages={this.state.beverages_messages}
              is_back={true}
              is_footer={true}
            />
            <BeverageDetails
              loader={this.props.loader}
              beverage_codes={this.state.beverages_codes}
              beverage_messages={this.state.beverages_messages}
            />
          </Route>
        </Switch>
        {footer}
      </React.Fragment>
    );
  }
}

export default withRouter(Container);
