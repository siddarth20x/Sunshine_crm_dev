const connection = require("../config/db");

// const commonController = {
//     executeQuery(qry, args, callback) {
//         connection.query(qry, args, (err, rows, fields) => {
//             if (err) {
//                 return callback(err); // return early if there is an error
//             }
//             callback(null, rows, fields); // call callback with results
//         });
//     }
// }

//! Promise based execution of the queries for better handling of errors
const commonController = {
  executeQuery(qry, args) {
    return new Promise((resolve, reject) => {
      connection.query(qry, args, (err, rows, fields) => {
        if (err) {
          reject(err); // reject the promise with the error
          return;
        }
        resolve({ rows, fields }); // resolve the promise with the rows and fields
      });
    });
  },
};

module.exports = commonController;
