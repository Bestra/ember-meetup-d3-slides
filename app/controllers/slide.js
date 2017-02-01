import Ember from "ember";
import random from "d3-random";
export default Ember.Controller.extend({
  data: Ember.computed(function() {
    return this.createData();
  }),
  createData() {
    let appleNums = random.randomUniform(320, 3840);
    let bananaNums = random.randomUniform(480, 1920);
    return [
      {
        month: new Date(2015, 0, 1),
        apples: appleNums(),
        bananas: bananaNums(),
        cherries: 960,
        dates: 400
      },
      {
        month: new Date(2015, 1, 1),
        apples: appleNums(),
        bananas: bananaNums(),
        cherries: 960,
        dates: 400
      },
      {
        month: new Date(2015, 2, 1),
        apples: appleNums(),
        bananas: bananaNums(),
        cherries: 640,
        dates: 400
      },
      {
        month: new Date(2015, 3, 1),
        apples: appleNums(),
        bananas: bananaNums(),
        cherries: 640,
        dates: 400
      }
    ];
  },
  actions: {
    refreshData() {
      this.set("data", this.createData());
    }
  }
});
