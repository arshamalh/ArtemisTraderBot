const socket = io();
let realTimePrice;
let realUtBotPrice;
let dataObject = {}
let newIndSetObj = {};
let symbol = "BTCUSDT";
let init_data;
let targetObj = {};
let stopTarget;
let stopTargets = [];

function calculate_amount(amount, leverage) {
  return parseInt(Number(amount) * Number(leverage) / realTimePrice * 1000) / 1000;
}

function calculate_stopLoss(risk, leverage) {
  let stopLoss;
  if (dataObject['side'] === 'buy') {
    stopLoss = realTimePrice * ( 1 + 0.004 - (risk / leverage)); /// 0.004 is for commission
    if (stopLoss > realTimePrice * 0.01) return stopLoss;
  } else if (dataObject['side'] === 'sell') {
    stopLoss = realTimePrice * ( 1 + 0.004 + (risk / leverage)); /// 0.004 is for commission
    if (stopLoss > realTimePrice * 0.01) return stopLoss;
  }
  return null;
}

/******* Web Socket */
/// Asset Price
socket.on("AssetPrice", function (msg) {
  $("#price").html(msg + "$");
  realTimePrice = Number(msg);
});

// Account Balance
socket.on("AccountBalance", function (msg) {
  $("#nav-balance").html(Math.round(msg * 100) / 100 + "$");
  $("#BalanceRange").attr("max", msg);
});

/// UTBOT Rate
socket.on("UtBotRate", function (msg) {
  realUtBotPrice = Math.round(msg * 100) / 100;
  $("#UtBotRate").html(Math.round(msg * 100) / 100);
  if (realUtBotPrice < realTimePrice) {
    $("#status").removeClass("btn-primary btn-danger").addClass("btn-success");
  } else {
    $("#status").removeClass("btn-primary btn-success").addClass("btn-danger");
  }
});

// Account History: // list of 20 last trades.
socket.on("getOrders", function (msg) {
  $("#closedOrders").empty()
  msg.forEach(item => {
    if (Number(item.realizedPnl) !== 0) {
      $("#closedOrders").append("<tr>" +
        "<td>" + item.side + "</td>" +
        "<td>" + item.realizedPnl + "</td>" +
        "<td>" + "Closed" + "</td>" +
        "</tr>")
    }
  })
});

// Last Opened Order (or list of last opened orders)
socket.on("openedOrders", function (msg) {
  $("#openedOrders").empty()
  msg.forEach(item => {
    let side = Number(item.positionAmt) > 0 ? "BUY" : "SELL";
    $("#openedOrders").prepend('<tr class="openOrderTR" data-toggle="modal" data-target="#OrderDetailsModal">' +
      "<td>" + side + "</td>" +
      "<td>" + 0 + "</td>" +
      "<td>" + "Active" + "</td>" +
      "</tr>")
    targetObj['side'] = side; // hold this value to use in target suggestions
  })
})

// Get last order everytime new order gets created.
socket.on("LastOrder", function (msg) {
  init_data.lastOrder = msg;
})

// When new order gets created, we will recieve a socket message from the server.
socket.on("order_opened", function (msg) {
  alert(msg.msg);
  $(".Loading").css("display", "none")
  socket.emit("Update", true) // update the table
  if (msg.code === 200) $("#confirm").prop('disabled', true);
});

// when new order gets closed, we will recieve a socket message from the server.
socket.on("order_closed", function (msg) {
  alert(msg.msg)
  socket.emit("Update", true)
  $(".Loading").css("display", "none")
  if (msg.code === 200) {
    $("#confirm").prop('disabled', false);
  }
})

// Gets some initial data about indicators and their default settings for the first time that we connect to the server.
socket.on("init", function (msg) {
  init_data = msg; // Set Global init_data by msg.

  //****** UT BOT initial settings. ******//
  /// ATR len slider settings
  const $atrLenRange = $("#atrLenRange");
  $atrLenRange.attr("value", init_data.utbot.atrlen);
  $(".atrLenSpan").html("ATR Length (" + $atrLenRange.val() + ")");
  $("#atrLenVal").html($atrLenRange.val());

  /// Sensitivity len slider Settings.
  const $sensitivityRange = $("#sensitivityRange");
  $sensitivityRange.attr("value", init_data.utbot.sensitivity);
  $(".sensitivitySpan").html("Sensitivity (" + $sensitivityRange.val() + ")");
  $("#sensitivityVal").html($sensitivityRange.val());

  console.log(init_data);
})

// When settings get applied to our chart, we get a message from the server.
socket.on("newIndSetDone", (msg) => {
  $(".Loading").css("display", "none")
  if (msg) alert("Settings applied successfully.") /// TODO: handle this msg better.
  else alert("Something is going wrong.")
})

// Suggestions will arive as a list of prices. some of them can be null.
socket.on("TSuggestions", (targets) => {
  $("#TSuggestions").empty()
  targets.forEach(target => {
    /*** do This for each target ***/
    if (target !== null) {
      let element;
      if (target !== init_data.selectedTarget) {
        element = $('<div class="TSgg disable">' + target + ' $' + '</div>');
        $("#TSuggestions").append(element);
        $(element).click(function () {
          let flag = $(this).attr("class") !== "TSgg";
          $(".TSgg").attr("class", "TSgg disable");
          if (flag)
            $(this).attr("class", "TSgg");
            // hold selected target in the init_data, then we send init_data back to server after apply btn click, so after reload we don't loss selected item
            init_data['selectedTarget'] = target; 
            targetObj['price'] = target;
        })
      }
    }
  })
  
  // We call and use selected data seperately
  console.log("Selected Target: ", init_data.selectedTarget)
  if (init_data.selectedTarget) {
    let target = init_data.selectedTarget; 
    element = $('<div class="TSgg">' + target + ' $' + '</div>');
    $("#TSuggestions").prepend(element);
    $(element).click(function () {
      let flag = $(this).attr("class") !== "TSgg";
      if (flag)
        $(this).attr("class", "TSgg");
        init_data['selectedTarget'] = target;
        targetObj['price'] = target;
    })
  }
})

// When price touch selected target or trailing stop target. TODO: Seperate them.
socket.on("TouchedTarget", (res) => {
  console.log("Touched Target Response: ", res);
  if (res.code === 200) {
    alert(res.msg)
    $("#confirm").prop('disabled', false);
    socket.emit("Update", true)
  } else {
    alert("An error occured in closing your order after touching the target.")
  }
})

// When your selected target apply in backend.
socket.on("TargetApplied", (res) => {
  alert("Target: " + res.price + " is applied.")
})

// When StopLoss that created automatically get touched.
socket.on("TouchedStopLoss", (res) => {
  alert(res.msg);
  $("#confirm").prop('disabled', false);
  socket.emit("Update", true);
})
/* Web Socket ******/

/***** JQuery */
$(document).ready(function () {
  const $valueLeverage = $("#LeverageRange");
  const $valueAmount = $("#BalanceRange"); 
  const $valueRisk = $("#RiskRange");

  /// Balance Range Slider
  $valueAmount.on("input change", () => {
    $(".BalanceHeadSpan").html("Amount (" + $valueAmount.val() + "$)");
    $("#BalanceValueSpan").html(
      Math.round(($valueAmount.val() / $("#BalanceRange").attr("max")) * 100) +
      "%"
    );
    $("#confirm").html("Confirm (" + calculate_amount($valueAmount.val(), $valueLeverage.val()) + " BTC)")
  });

  /// Leverage Range Slider
  $valueLeverage.on("input change", () => {
    $("#LeverageValueSpan").html($valueLeverage.val());
    $(".LeverageHeadSpan").html("Leverage (" + $valueLeverage.val() + "x)");
    $("#confirm").html("Confirm (" + calculate_amount($valueAmount.val(), $valueLeverage.val()) + " BTC)")
  });

  /// Risk Range Slider
  $valueRisk.on("input change", () => {
    $(".RiskHeadSpan").html("Risk (" +  $valueRisk.val() + " %)" )
    $("#RiskValueSpan").html( $valueRisk.val() + "%")
    dataObject['stopLoss'] = calculate_stopLoss($valueRisk.val() / 100, $valueLeverage.val());
    console.log(dataObject['stopLoss'])
  });

  /*** UTBOT Settings Modal */
  const $sensitivityRange = $("#sensitivityRange");
  const $atrLenRange = $("#atrLenRange");
  /// Sensitivity Slider
  $sensitivityRange.on("input change", () => {
    $(".sensitivitySpan").html("Sensitivity (" + $sensitivityRange.val() + ")");
    $("#sensitivityVal").html($sensitivityRange.val());
  });

  /// ATR Length
  $atrLenRange.on("input change", () => {
    $(".atrLenSpan").html("ATR Length (" + $atrLenRange.val() + ")");
    $("#atrLenVal").html($atrLenRange.val());
  });
  /* UTBOT Settings Modal ***/

  /// time frame value
  $(".tfValue").click(function (obj) {
    $(".dropbtn").html(obj.target.innerText) // timeframe = $(".dropbtn").html();
    socket.emit("newIndSet", {timeframe: $(".dropbtn").html(), sensitivity: init_data.utbot.sensitivity, atrlen: init_data.utbot.atrlen})
    $(".Loading").css("display", "block")
  })

  $(".bottomBtn").click((function (obj) { /// TODO: ISOLATED CROSSED BUY SELL are in the same class. I have to separate them.
    if (obj.target.innerText === "CROSSED" || obj.target.innerText === "ISOLATED") {
      dataObject['margin_type'] = obj.target.innerText.toLowerCase()
      if (dataObject['margin_type'] === "crossed") {
        $("#crossed-margin-type").addClass("active");
        $("#isolated-margin-type").removeClass("active");
      } else if (dataObject['margin_type'] === "isolated") {
        $("#isolated-margin-type").addClass("active");
        $("#crossed-margin-type").removeClass("active");
      }
    } else {
      dataObject['side'] = obj.target.innerText.toLowerCase()
    }
  }))

  $("#confirm").click(function (obj) {
    let leverage = parseInt($valueLeverage.val())
    dataObject['amount'] = calculate_amount($valueAmount.val(), $valueLeverage.val());
    dataObject['leverage'] = leverage;
    dataObject['symbol'] = "BTCUSDT";
    socket.emit("open_order", dataObject);
    $(".Loading").css("display", "block")
    $("#myModal").modal("hide");
  })

  $("#closeOrderBTN").click(function (obj) {
    socket.emit("close_order", symbol);
    $("#OrderDetailsModal").modal("hide");
    $(".Loading").css("display", "block")
  })

  /*** Sending New UT Bot Settings */
  $("#applyUTBsettings").click(function (obj) {
    newIndSetObj['timeframe'] = $(".dropbtn").html();
    newIndSetObj['sensitivity'] = Number($sensitivityRange.val())
    newIndSetObj['atrlen'] = Number($atrLenRange.val())
    newIndSetObj['smoothing'] = 'rma'; // init_data.atr.smoothing;
    console.log(newIndSetObj);
    socket.emit("newIndSet", newIndSetObj);
    $("#UTBotSet").modal("hide");
    $(".Loading").css("display", "block")
  })
  /* Sending New UT Bot Settings ***/

  /**** Show Suggestions */
  $("#showSggBTN").click(function () {
    socket.emit("getSgg", targetObj.side);
  })
  /* Show Suggestions ****/

  $("#ApplyTarget").click(function () {
    socket.emit("ApplyTarget", targetObj);
    $("#TSggModal").modal("hide");
  })

  //// TODO: Multi Stop Target Selection has to improve...
  $("#AddStopTarget").click(function () {
    stopTarget = prompt("Price to Set Stop Target: ")
    if (stopTarget !== null) {
      // handle if stop target is greater than entry price and less than close price
      if (init_data.lastOrder.side.toLowerCase() === "buy") {
        console.log("Last order is in the Buy State.")
        if (init_data.lastOrder.price <= stopTarget && stopTarget <= realTimePrice) {
          socket.emit("stopTarget", stopTarget) // socket.emit
          $("#StopTargets").prepend('<div class="StopTargetItem">' + stopTarget + ' $' + '</div>');
          stopTargets.push({"price": stopTarget, "amount": stopCloseAmount})
        } else {
          alert("Your Stop Target price must be between " + init_data.lastOrder.price + " and " + realTimePrice)
        }
      } else if (init_data.lastOrder.side.toLowerCase() === "sell") {
        console.log("last order is in the Sell State")
        if (init_data.lastOrder.price >= stopTarget && stopTarget >= realTimePrice) {
          socket.emit("stopTarget", stopTarget) // socket.emit
          $("#StopTargets").prepend('<div class="StopTargetItem">' + stopTarget + ' $' + '</div>');
          stopTargets.push({"price": stopTarget, "amount": stopCloseAmount})
        } else {
          console.log("Last order price: ", init_data.lastOrder.price);
          console.log("Stop target: ", stopTarget);
          console.log("Real Time price: ", realTimePrice)
          alert("Your Stop Target price must be between " + init_data.lastOrder.price + " and " + realTimePrice)
        }

      }
    }
  })

  $("#ConfirmStopTarget").click(function () {
    socket.emit("stopTargets", stopTargets)
  })
});
/* JQuery *****/
