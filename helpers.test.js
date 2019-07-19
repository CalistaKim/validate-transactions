const helpers = require("./helpers");

describe("helpers function tests", () => {
  let result;
  let expectedResult;
  let currentLoadRequest;
  let loadHistory;
  test("getLoadHistory", () => {
    // customer has requested to load earlier this day
    loadHistory = {
      "2": [
        { id: "30081", load_amount: "$3318.47", time: "2000-01-02T03:36:54Z" }
      ]
    };
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$1413.18",
      time: "2000-01-02T13:50:34Z"
    };
    expectedResult = {
      loadAmount_day: 3318.47,
      loadAmount_week: 3318.47,
      loadCount: 1
    };
    helpers.testhelper(loadHistory);
    result = helpers.getLoadHistory(currentLoadRequest);
    expect(result).toEqual(expectedResult);

    // current load request is the earliest request this day / week
    loadHistory = {};
    currentLoadRequest = {
      id: "30081",
      customer_id: "2",
      load_amount: "$3318.47",
      time: "2000-01-02T03:36:54Z"
    };

    helpers.testhelper(loadHistory);
    result = helpers.getLoadHistory(currentLoadRequest);
    expect(result).toEqual(null);
  });
  test("handleLoadRequest", () => {
    // customer has requested to load within limits
    loadHistory = {
      "2": [
        { id: "30081", load_amount: "$3318.47", time: "2000-01-02T03:36:54Z" }
      ]
    };
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$1413.18",
      time: "2000-01-02T13:50:34Z"
    };
    expectedResult = { id: "15887", customer_id: "2", accepted: true };
    helpers.testhelper(loadHistory);
    result = helpers.handleLoadRequest(currentLoadRequest);
    expect(result).toEqual(expectedResult);

    // customer has requested to load exceeding limits for the day
    loadHistory = {
      "2": [
        { id: "30081", load_amount: "$3318.47", time: "2000-01-02T03:36:54Z" }
      ]
    };
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$5000.00",
      time: "2000-01-02T13:50:34Z"
    };
    expectedResult = { id: "15887", customer_id: "2", accepted: false };
    helpers.testhelper(loadHistory);
    result = helpers.handleLoadRequest(currentLoadRequest);
    expect(result).toEqual(expectedResult);

    // customer has requested to load exceeding counts for the day
    loadHistory = {
      "2": [
        { id: "30081", load_amount: "$10", time: "2000-01-03T03:36:54Z" },
        { id: "30082", load_amount: "$10", time: "2000-01-03T03:38:54Z" },
        { id: "30083", load_amount: "$10", time: "2000-01-03T03:39:54Z" }
      ]
    };
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$10.00",
      time: "2000-01-03T03:46:54Z"
    };
    helpers.testhelper(loadHistory);
    expectedResult = { id: "15887", customer_id: "2", accepted: false };
    result = helpers.handleLoadRequest(currentLoadRequest);
    expect(result).toEqual(expectedResult);

    // customer has requested to load exceeding limits for the week
    loadHistory = {
      "2": [
        { id: "30081", load_amount: "$4444", time: "2000-01-03T03:36:54Z" },
        { id: "30082", load_amount: "$4444", time: "2000-01-03T03:37:54Z" },
        { id: "30083", load_amount: "$4444", time: "2000-01-03T03:38:54Z" },
        { id: "30084", load_amount: "$4444", time: "2000-01-03T03:39:54Z" }
      ]
    };
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$3000.00",
      time: "2000-01-03T05:39:54Z"
    };
    helpers.testhelper(loadHistory);
    expectedResult = { id: "15887", customer_id: "2", accepted: false };
    result = helpers.handleLoadRequest(currentLoadRequest);
    expect(result).toEqual(expectedResult);
  });
});
