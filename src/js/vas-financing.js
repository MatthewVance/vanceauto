/*!
 * Vance Auto Sales Financing v1.0 (https://vanceauto.com)
 * Copyright 2016 Vance Auto Sales
 * Licensed under the MIT, GPL licenses
/*!
 * Accrue.js
 * http://accruejs.com
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 1.1.0
 */

// start accrue.js
$(document).ready(function() {
  // set up normal loan calculation
  $(".calculator-loan").accrue({
    mode: "basic",
    field_titles: {
      amount: "Loan Amount",
      rate: "Rate (APR)",
      term: "Term"
    },
    field_comments: {
      amount: "",
      rate: "",
      rate_compare: "",
      term: "Format: 12m, 36m, 3y, 7y"
    },
    // set the output element
    response_output_div: ".results",

    // set the response format
    response_basic:
      '<p><strong>Monthly Payment:</strong><br />$%payment_amount%</p>' +
      '<p><strong>Number of Payments:</strong><br />%num_payments%</p>' +
      '<p><strong>Total Payments:</strong><br />$%total_payments%</p>' +
      '<p><strong>Total Interest:</strong><br />$%total_interest%</p>',

    // set error text for when one of the fields is empty or invalid.
    error_text: "Please enter values in all the fields."
  });

});
