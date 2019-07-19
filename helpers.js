const moment = require("moment-timezone");

module.exports = {
  loadHistory: {},
  handleLoadRequestWrapper: function(sourceData) {
    const output = sourceData.map(loadReq => {
      return this.handleLoadRequest(loadReq);
    });
    return output;
  },

  handleLoadRequest: function(currentLoadRequest) {
    const { customer_id, id, load_amount } = currentLoadRequest;
    const current_load_amount = Number(load_amount.replace(/[^0-9.-]+/g, ""));
    let loadAmount_day = current_load_amount;
    let loadAmount_week = current_load_amount;
    let loadCount = 1;
    let loadResponse = {
      id,
      customer_id,
      accepted: false
    };

    const load_receipts = this.getLoadHistory(currentLoadRequest);

    if (load_receipts) {
      this.loadHistory[customer_id].push(currentLoadRequest);
      loadAmount_day += load_receipts.loadAmount_day;
      loadAmount_week += load_receipts.loadAmount_week;
      loadCount += load_receipts.loadCount;
    }

    if (loadAmount_day <= 5000 && loadAmount_week <= 20000 && loadCount <= 3) {
      loadResponse.accepted = true;
    }
    return loadResponse;
  },

  getLoadHistory(currentLoadRequest) {
    const { customer_id, time } = currentLoadRequest;
    const current_time = moment.utc(time);
    const current_week = current_time.isoWeek();
    const current_year = current_time.year();

    let pastLoadAmounts = {
      loadAmount_day: 0,
      loadAmount_week: 0,
      loadCount: 0
    };
    console.log(this.loadHistory);
    console.log("customer_id ", customer_id);
    console.log(this.loadHistory[customer_id]);
    if (!this.loadHistory[customer_id]) {
      console.log("NULL!!!!!!!!");
      this.loadHistory[customer_id] = [currentLoadRequest];
      return null;
    }
    const customer_history = this.loadHistory[customer_id];

    pastLoadAmounts = customer_history.reduce(
      (pastLoadAmounts, historyitem) => {
        const { load_amount, time } = historyitem;
        const compare_load_amount = Number(
          load_amount.replace(/[^0-9.-]+/g, "")
        );
        const compare_time = moment.utc(time);
        const compare_week = compare_time.isoWeek();
        const compare_year = compare_time.year();
        const isSameIsoWeek =
          compare_year == current_year && compare_week == current_week;
        const isSameDay = moment.utc(compare_time).isSame(current_time, "day");
        const isOverDailyLimit =
          compare_load_amount > 5000 ||
          pastLoadAmounts.loadAmount_day >= 5000 ||
          pastLoadAmounts.loadAmount_day + compare_load_amount > 5000;

        if (isSameIsoWeek && isSameDay && !isOverDailyLimit) {
          pastLoadAmounts.loadAmount_day += compare_load_amount;
          pastLoadAmounts.loadAmount_week += compare_load_amount;
          pastLoadAmounts.loadCount++;
        }
        return pastLoadAmounts;
      },
      pastLoadAmounts
    );

    return pastLoadAmounts;
  },
  testhelper: function(payload) {
    this.loadHistory = payload;
  }
};
