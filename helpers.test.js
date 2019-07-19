const helpers = require("./helpers");

describe("helpers function tests", () => {
  let data;
  let result;
  let expectedResult;
  let loadRequestRecords;
  let currentLoadRequest;

  test("storeLoadRequests", () => {
    data = [
      {
        id: "15887",
        customer_id: "2",
        load_amount: "$3318.47",
        time: "2000-01-01T00:00:00Z"
      },
      {
        id: "30081",
        customer_id: "2",
        load_amount: "$1413.18",
        time: "2000-01-01T01:01:22Z"
      },
      {
        id: "10694",
        customer_id: "1",
        load_amount: "$785.11",
        time: "2000-01-01T03:04:06Z"
      }
    ];
    expectedResult = {
      2: [
        { id: "15887", load_amount: "$3318.47", time: "2000-01-01T00:00:00Z" },
        { id: "30081", load_amount: "$1413.18", time: "2000-01-01T01:01:22Z" }
      ],
      1: [{ id: "10694", load_amount: "$785.11", time: "2000-01-01T03:04:06Z" }]
    };
    result = helpers.storeLoadRequests(data);
    expect(result).toEqual(expectedResult);

    data = [];
    result = helpers.storeLoadRequests(data);
    expect(result).toEqual({});
  });
  test("getLoadHistory", () => {
    // customer has requested to load earlier this day
    loadRequestRecords = [
      { id: "30081", load_amount: "$3318.47", time: "2000-01-02T03:36:54Z" },
      { id: "15887", load_amount: "$1413.18", time: "2000-01-02T13:50:34Z" }
    ];
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

    result = helpers.getLoadHistory(currentLoadRequest, loadRequestRecords);
    expect(result).toEqual(expectedResult);

    // current load request is the earliest request this day / week
    currentLoadRequest = {
      id: "30081",
      customer_id: "2",
      load_amount: "$3318.47",
      time: "2000-01-02T03:36:54Z"
    };

    expectedResult = {
      loadAmount_day: 0,
      loadAmount_week: 0,
      loadCount: 0
    };

    result = helpers.getLoadHistory(currentLoadRequest, loadRequestRecords);
    expect(result).toEqual(expectedResult);
  });
  test("handleLoadRequest", () => {
    // customer has requested to load within limits
    loadRequestRecords = [
      { id: "30081", load_amount: "$3318.47", time: "2000-01-02T03:36:54Z" },
      { id: "15887", load_amount: "$1413.18", time: "2000-01-02T13:50:34Z" }
    ];
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$1413.18",
      time: "2000-01-02T13:50:34Z"
    };
    expectedResult = { id: "15887", customer_id: "2", accepted: true };

    result = helpers.handleLoadRequest(currentLoadRequest, loadRequestRecords);
    expect(result).toEqual(expectedResult);

    // customer has requested to load exceeding limits for the day
    loadRequestRecords = [
      { id: "30081", load_amount: "$3318.47", time: "2000-01-02T03:36:54Z" },
      { id: "15887", load_amount: "$5000.00", time: "2000-01-02T13:50:34Z" }
    ];
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$5000.00",
      time: "2000-01-02T13:50:34Z"
    };
    expectedResult = { id: "15887", customer_id: "2", accepted: false };

    result = helpers.handleLoadRequest(currentLoadRequest, loadRequestRecords);
    expect(result).toEqual(expectedResult);

    // customer has requested to load exceeding counts for the day
    loadRequestRecords = [
      { id: "30081", load_amount: "$10", time: "2000-01-03T03:36:54Z" },
      { id: "30082", load_amount: "$10", time: "2000-01-03T03:38:54Z" },
      { id: "30083", load_amount: "$10", time: "2000-01-03T03:39:54Z" },
      { id: "15887", load_amount: "$10", time: "2000-01-03T03:46:54Z" }
    ];
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$10.00",
      time: "2000-01-03T03:46:54Z"
    };

    expectedResult = { id: "15887", customer_id: "2", accepted: false };
    result = helpers.handleLoadRequest(currentLoadRequest, loadRequestRecords);
    expect(result).toEqual(expectedResult);

    // customer has requested to load exceeding limits for the week
    loadRequestRecords = [
      { id: "30081", load_amount: "$4444", time: "2000-01-03T03:36:54Z" },
      { id: "30082", load_amount: "$4444", time: "2000-01-03T03:37:54Z" },
      { id: "30083", load_amount: "$4444", time: "2000-01-03T03:38:54Z" },
      { id: "30084", load_amount: "$4444", time: "2000-01-03T03:39:54Z" },
      { id: "15887", load_amount: "$3000", time: "2000-01-03T05:39:54Z" }
    ];
    currentLoadRequest = {
      id: "15887",
      customer_id: "2",
      load_amount: "$3000.00",
      time: "2000-01-03T05:39:54Z"
    };

    expectedResult = { id: "15887", customer_id: "2", accepted: false };
    result = helpers.handleLoadRequest(currentLoadRequest, loadRequestRecords);
    expect(result).toEqual(expectedResult);
  });
});
