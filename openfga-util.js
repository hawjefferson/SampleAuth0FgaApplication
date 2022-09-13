const { OpenFgaApi, CredentialsMethod } = require("@openfga/sdk");
const { Auth0FgaApi } = require('@auth0/fga');
const { FGA_TYPE, FGA_RELATIONSHIP } = require("./constants");
const { relationships } = require("./data-relationships");

const EXPENSES_STORE_NAME = "Sample FGA Demo";

const AUTH0_FGA_ENVIRONMENT = "us";
const AUTH0_FGA_STORE_ID = "01GCTJ3YVEZX4HQS53BZRKWJX9";
const AUTH0_FGA_CLIENT_ID = "GeXFzv9239hR4E0g52VydVVFWiZa7Ufy";
const AUTH0_FGA_CLIENT_SECRET = "gxOyw6wgJH-IkXv0dHbou70Ot2eqFzE6hiljkEijQotZOO03UP1NWQUKSdwKW0r8";
const EXPENSES_AUTHORISATION_MODEL = {
  "type_definitions": [
    {
      "type": FGA_TYPE.Expense,
      "relations": {
        [FGA_RELATIONSHIP.Submitter]: {
          "this": {}
        },
        [FGA_RELATIONSHIP.Approver]: {
          "tupleToUserset": {
            "tupleset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Submitter
            },
            "computedUserset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Manager
            }
          }
        },
        [FGA_RELATIONSHIP.Rejecter]: {
          "tupleToUserset": {
            "tupleset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Submitter
            },
            "computedUserset": {
              "object": "",
              "relation": FGA_RELATIONSHIP.Manager
            }
          }
        },
        [FGA_RELATIONSHIP.Viewer]: {
          "union": {
            "child": [
              {
                "this": {}
              },
              {
                "computedUserset": {
                  "object": "",
                  "relation": FGA_RELATIONSHIP.Submitter
                }
              },
              {
                "computedUserset": {
                  "object": "",
                  "relation": FGA_RELATIONSHIP.Approver
                }
              },
              {
                "computedUserset": {
                  "object": "",
                  "relation": FGA_RELATIONSHIP.Rejecter
                }
              }
            ]
          }
        }
      }
    },
    {
      "type": FGA_TYPE.Employee,
      "relations": {
        [FGA_RELATIONSHIP.Manager]: {
          "union": {
            "child": [
              {
                "this": {}
              },
              {
                "tupleToUserset": {
                  "tupleset": {
                    "object": "",
                    "relation": FGA_RELATIONSHIP.Manager
                  },
                  "computedUserset": {
                    "object": "",
                    "relation": FGA_RELATIONSHIP.Manager
                  }
                }
              }
            ]
          }
        }
      }
    }
  ]
};

let expensesStoreId;

function getAuth0FgaApiClient(){
  return new Auth0FgaApi({
    environment: AUTH0_FGA_ENVIRONMENT, // can be: "us"/"staging"/"playground"
    storeId: AUTH0_FGA_STORE_ID,
    clientId: AUTH0_FGA_CLIENT_ID, // Required for all environments except playground
    clientSecret: AUTH0_FGA_CLIENT_SECRET, // Required for all environments except playground
  });
}

function getOpenFgaApiClient() {

  const openFgaApiConfiguration = {
   // apiScheme: process.env.FGA_API_SCHEME || "https",
    apiHost: "api.us1.fga.dev",
    storeId: "01GCTJ3YVEZX4HQS53BZRKWJX9",
    credentials: {
      method: CredentialsMethod.ApiToken,
      config: {
        token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ino4TzF1WEpUMkZ5UHRqZ3RmZDZoMiJ9.eyJodHRwczovL2ZnYS5kZXYvY2xhaW1zL2N1c3RvbWVyX2lkIjoiMDFHQ1RKM1hHRkRHQ0ZaMFhXUjJSSDdCMDciLCJodHRwczovL2ZnYS5kZXYvY2xhaW1zL3N0b3JlX2lkIjoiMDFHQ1RKM1lWRVpYNEhRUzUzQlpSS1dKWDkiLCJpc3MiOiJodHRwczovL2ZnYS51cy5hdXRoMC5jb20vIiwic3ViIjoiR2VYRnp2OTIzOWhSNEUwZzUyVnlkVlZGV2laYTdVZnlAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vYXBpLnVzMS5mZ2EuZGV2LyIsImlhdCI6MTY2MzA0ODEzMCwiZXhwIjoxNjYzMTM0NTMwLCJhenAiOiJHZVhGenY5MjM5aFI0RTBnNTJWeWRWVkZXaVphN1VmeSIsInNjb3BlIjoicmVhZDp0dXBsZXMgd3JpdGU6dHVwbGVzIGNoZWNrOnR1cGxlcyBleHBhbmQ6dHVwbGVzIHJlYWQ6YXV0aG9yaXphdGlvbl9tb2RlbHMgd3JpdGU6YXV0aG9yaXphdGlvbl9tb2RlbHMgcmVhZDphc3NlcnRpb25zIHdyaXRlOmFzc2VydGlvbnMgcmVhZDpjaGFuZ2VzIGxpc3Q6b2JqZWN0cyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.fUitNC3I855XWYKBMgXHV0aMpnBcfpfgvBiq6GTMr8VGed6uriamY7E4C_tz6a1_D0xxjQtcQHVndSxyieyykD4Hp1c5JfH4XTl7ZWF_tOhD41H3Co9c5eu3XZKp_1RY3NO_dURNfL5cbn8sJDNgNNtNRkQZANiiZe6odLToyBPWmHU_5-Z0MSflUVBOdxt2-okY4468dZga0UvXrX2ryV0L_I9wcz8I-PMZpMz0AVNghdF4xN2JsN82xhI44gCiwY6J7FUhI3IIUEWsUlCNbms8Ub51CToBOXU4zdGsLVt5q_asvG7JSUNSWzwXZMBRBQVF6qb1Edt5wQvjMK5CsQ", // will be passed as the "Authorization: Bearer ${ApiToken}" request header
      }
    }
    //process.env.FGA_API_HOST || "localhost:8080"
  };

  if (expensesStoreId) {
    openFgaApiConfiguration.storeId = expensesStoreId;
  }

  return new OpenFgaApi(openFgaApiConfiguration);
}

async function expensesStoreExists() {
  try {
    const { stores } = await getOpenFgaApiClient().listStores();
    for (const store of stores) {
      if (store.name === EXPENSES_STORE_NAME) {
        expensesStoreId = store.id;
        return true;
      }
    }
  } catch ( e ) {
    console.log(e);
  }

  return false;
};

async function createExpensesStore() {
  try {
    const { id } = await getOpenFgaApiClient().createStore({
      name: EXPENSES_STORE_NAME
    });
    expensesStoreId = id;
    return true;
  } catch ( e ) {
    console.log(e);
  }

  return false;
};

async function writeExpensesAuthorisationModel() {
  try {
    await getOpenFgaApiClient().writeAuthorizationModel(EXPENSES_AUTHORISATION_MODEL);
    return true;
  } catch ( e ) {
    console.log(e);
  }

  return false;
}

async function writeEmployeeExpenseRelationships() {
  try {
    await getOpenFgaApiClient().write({
      writes: {
        tuple_keys: relationships
      }
    });  
    return true;
  } catch ( e ) {
    console.log(e);
  }

  return false;
}

const initialiseExpensesStore = module.exports.initialiseExpensesStore = async function() {
  if (!true) {
    //await expensesStoreExists()
    if (await createExpensesStore()) {
      if (!await writeExpensesAuthorisationModel()) {
        console.log("Failed to create Expenses authorisation model in OpenFGA.");
        process.exit();
      }
    
      if (!await writeEmployeeExpenseRelationships()) {
        console.log("Failed to write employee expense relationships to OpenFGA.");
        process.exit();
      }    
    } else {
      console.log("Failed to create Expenses store in OpenFGA. Please make sure that OpenFGA is running.");
      process.exit();      
    }
  }
}

const userHasRelationshipWithObject = module.exports.userHasRelationshipWithObject = async function(user, relationship, object) {
  try {
    //getOpenFgaApiClient
    let { allowed } = await getAuth0FgaApiClient().check({
      tuple_key: {
        user: user,
        relation: relationship,
        object: object
      }
    });
    return allowed;
  } catch ( e ) {
    console.log(e);
    return false;
  }
}