const jwt = require('jsonwebtoken');

const {
  DynamoDBClient
} = require('@aws-sdk/client-dynamodb');

const {
  DynamoDBDocumentClient,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');



// DYNAMODB SETUP

const client =
new DynamoDBClient({

  region:
  process.env.AWS_REGION
});

const dynamo =
DynamoDBDocumentClient.from(
  client
);



// LOGIN CONTROLLER

exports.loginUser =
async (req, res) => {

  try {

    console.log("BODY:", req.body);

    const {
      username,
      password
    } = req.body;

    console.log("USERNAME:", username);
    console.log("PASSWORD:", password);

    // VALIDATION

    if(!username || !password){

      return res.status(400)
      .json({

        success: false,

        message:
        'Username and password required'
      });
    }

    // GET USER FROM DYNAMODB

    const result =
    await dynamo.send(

      new GetCommand({

        TableName:
        'gs_solar_users',

        Key: {
          username
        }
      })

    );

    console.log("DYNAMO RESULT:", result);

    const user =
    result.Item;

    console.log("USER:", user);

    // USER NOT FOUND

    if (!user) {

      return res.status(401)
      .json({

        success: false,

        message:
        'Invalid credentials'
      });
    }

    // SIMPLE PASSWORD CHECK

    if (password !== user.password) {

      console.log("PASSWORD NOT MATCHING");

      return res.status(401)
      .json({

        success: false,

        message:
        'Invalid credentials'
      });
    }

    console.log("PASSWORD MATCHED");

    // JWT TOKEN

    const token =
    jwt.sign(

      {
        username:
        user.username,

        role:
        user.role,

        siteId:
        user.siteId
      },

      process.env.JWT_SECRET || "mysecret123",

      {
        expiresIn: '7d'
      }
    );

    console.log("TOKEN CREATED");

    // SUCCESS RESPONSE

    res.json({

      success: true,

      token,

      user: {

        username:
        user.username,

        role:
        user.role,

        siteId:
        user.siteId
      }
    });

  }

  catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    res.status(500)
    .json({

      success: false,

      message:
      'Server Error'
    });
  }
};