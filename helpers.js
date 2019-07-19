const moment = require("moment-timezone");
module.exports = {
  storeLoadRequests: function(data) {
    let formattedData = {};
    data.forEach(loadReq => {
      const { id, customer_id, load_amount, time } = loadReq;
      let customerData = {
        id,
        load_amount,
        time
      };
      if (!formattedData.hasOwnProperty(customer_id)) {
        customerData = [customerData];
        formattedData[`${customer_id}`] = customerData;
      } else {
        formattedData[`${customer_id}`].push(customerData);
      }
    });
    return formattedData;
  },
  handleLoadRequestWrapper: function(sourceData, formattedData) {
    const output = sourceData.map(loadReq => {
      const { customer_id } = loadReq;
      return this.handleLoadRequest(loadReq, formattedData[customer_id]);
    });
    return output;
  },
  handleLoadRequest: function(currentLoadRequest, loadRequestRecords) {
    const { customer_id, id, load_amount } = currentLoadRequest;
    let loadResponse = {
      id,
      customer_id,
      accepted: false
    };

    const current_load_amount = Number(load_amount.replace(/[^0-9.-]+/g, ""));
    let loadAmount_day = current_load_amount;
    let loadAmount_week = current_load_amount;
    let loadCount = 1;
    const loadHistory = this.getLoadHistory(
      currentLoadRequest,
      loadRequestRecords
    );
    loadAmount_day += loadHistory.loadAmount_day;
    loadAmount_week += loadHistory.loadAmount_week;
    loadCount += loadHistory.loadCount;

    if (loadAmount_day <= 5000 && loadAmount_week <= 20000 && loadCount <= 3) {
      loadResponse.accepted = true;
    }

    return loadResponse;
  },
  getLoadHistory: function(currentLoadRequest, loadRequestRecords) {
    let loadHistory = {
      loadAmount_day: 0,
      loadAmount_week: 0,
      loadCount: 0
    };

    loadRequestRecords.forEach(loadReq => {
      const {
        loadAmount_day: ld,
        loadAmount_week: lw,
        loadCount: lc
      } = this.compareRequests(currentLoadRequest, loadReq, loadHistory);
      loadHistory.loadAmount_day += ld;
      loadHistory.loadAmount_week += lw;
      loadHistory.loadCount += lc;
    });
    return loadHistory;
  },
  compareRequests: function(current_loadReq, compare_loadReq, loadHistory) {
    const loadInstance = {
        loadAmount_day: 0,
        loadAmount_week: 0,
        loadCount: 0
      },
      invalidRequestResponse = {
        loadAmount_day: 0,
        loadAmount_week: 0,
        loadCount: 0
      };

    const { time: c_time } = current_loadReq;
    const current_time = moment.utc(c_time);
    const current_week = current_time.isoWeek();
    const current_year = current_time.year();

    const { load_amount, time } = compare_loadReq;
    const compare_time = moment.utc(time);
    const compare_week = compare_time.isoWeek();
    const compare_year = compare_time.year();
    const compare_loadamount = Number(load_amount.replace(/[^0-9.-]+/g, ""));

    const isSameDate = moment.utc(compare_time).isSame(current_time);
    const compareDateIsBeforeCurrentDate = moment
      .utc(compare_time)
      .isBefore(current_time);
    const isSameIsoWeek =
      compare_year == current_year && compare_week == current_week;
    const isSameDay = moment.utc(compare_time).isSame(current_time, "day");
    const isOverWeeklyLimit =
      compare_loadamount > 20000 ||
      loadHistory.loadAmount_week >= 20000 ||
      loadHistory.loadAmount_week + compare_loadamount > 20000;
    const isOverDailyLimit =
      compare_loadamount > 5000 ||
      loadHistory.loadAmount_day >= 5000 ||
      loadHistory.loadAmount_day + compare_loadamount > 5000;

    if (isSameDate || !compareDateIsBeforeCurrentDate) {
      return invalidRequestResponse;
    } else if (compareDateIsBeforeCurrentDate) {
      if (isSameIsoWeek) {
        if (isOverWeeklyLimit) return invalidRequestResponse;
        if (isSameDay) {
          if (isOverDailyLimit) return invalidRequestResponse;
          loadInstance.loadAmount_day += compare_loadamount;
          loadInstance.loadAmount_week += compare_loadamount;
          loadInstance.loadCount++;
        }
      }
    }
    return loadInstance;
  }
};
