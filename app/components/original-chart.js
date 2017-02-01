import Ember from 'ember';
import shape from 'd3-shape';
import selection from 'd3-selection';
import transition from 'd3-transition';
export default Ember.Component.extend({
  chartData: Ember.computed('inputData', function() {
    let data = this.get('inputData');
    let dates = this.mapBy('date').map(date => Date.parse(date));
    let makeLayer = (name, xValues, yValues) =>
      ({
        name,
        startDate: xValues.get('firstObject'),
        endDate: xValues.get('lastObject'),
        values: xValues.map((xVal, i) => ({x: xVal, y: yValues[i]}))
      });

    return {
      snapDate: this.get('controllers.office.formattedSnapDate'),
        layers:
        [ makeLayer("billing", dates, data.mapBy('billing_count')),
          makeLayer("nonbilling", dates, data.mapBy('non_billing_count')),
          makeLayer("unavailable", dates, data.mapBy('unassignable_count')),
          makeLayer("overhead", dates, data.mapBy('overhead_count')),
        ]
    };
  }),

  didInsertElement() {
    Ember.run.once(this, 'update');
    return $(window).on('resize', () => {
      return Ember.run.debounce(this, this.update, 100);
    }
    );
  },

  update: (function() {
    return d3.select(this.$()[0])
      .data([ this.get('chartData') ])
      .call(this.get('chart'), this);
  }).observes('chartData'),

  renderChart() {
    let chart;
    let margin = {top: 0, right: 8, bottom: 0, left: 8};

    let height = 400;

    return chart = function(selection, emberParent) {
      let width = $(window).width() - margin.right - margin.left;
      return selection.each(function(data) {
        let { snapDate } = data;
        data = data.layers;
        let vals = data.mapProperty('values');

        let fmt = date => moment(date).format("MM/DD");
        let headCounts = vals[0].map((val, i) => val.y + vals[1][i].y + vals[2][i].y + vals[3][i].y);

        let dayCount = vals[0].length;
        let days = vals[0].mapProperty('x');
        let xScale = d3.scale.linear()
          .domain([0, dayCount - 1])
          .range([0, width]);
        let yScale = d3.scale.linear()
          .domain([0, d3.max(headCounts)])
          .range([height, 0]);
        let colors = d3.scale.category10();

        let stack = d3.layout.stack()
          .values(d => d.values);
        let svg = selection.selectAll("svg").data([data]);
        svg.enter().append("svg").append("g").attr("class", "chart");
        svg.attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);
        svg.select("g.chart")
          .attr("transform", `translate(${margin.left},${margin.top})`);
        svg = svg.select("g.chart");
        let myLayers = stack(data);

        let area = d3.svg.area()
          .x((d, i)=> xScale(i))
          .y0(d=> yScale(d.y0))
          .y1(d=> yScale(d.y0 + d.y));
        let areaGenerator = d => area(d.values);

        let line = d3.svg.line()
          .x((d, i) => xScale(i))
          .y(d => yScale(d.y));

        let lineGenerator = d => line(d.values);

        let paths = svg.selectAll("path").data(myLayers);
        let newPaths = paths.enter().append('path')
          .attr("class", d => d.name);
        paths.transition().attr("d", areaGenerator);

        let billingLine = svg.selectAll("path.billing-line").data(myLayers.filterProperty('name', 'billing'));
        let newLine = billingLine.enter().append("path").attr("class", "billing-line");
        billingLine.transition().attr("d", lineGenerator);

        let tickScale = xScale.copy().domain([1, dayCount - 2]);
        //
        //create the vertical rules
        let tickArray = tickScale.ticks(dayCount - 2);
        let tickDays = d3.permute(days, tickArray);
        let daysAndTicks = d3.zip(tickArray, tickDays);
        let xRule = svg.selectAll("g.vertical-rule")
          .data(daysAndTicks);
        let ruleEnter = xRule.enter().append("svg:g").attr("class", "vertical-rule");
        ruleEnter.append("svg:line").attr("y2", height);

        let setTooltipPosition = function(...args) {
          let [pos, date] = Array.from(args[0]);
          let calculateUtilization = function(...args1) {
            let [billing, nonbilling] = Array.from(args1[0]), p = args1[1];
            return Math.round((100.0 * billing[p]) / (billing[p] + nonbilling[p]));
          };


          let billingValues = myLayers.findBy('name', 'billing').values;
          let selectedDay = billingValues.find(item => fmt(item.x) === fmt(date));

          let dayIndex = billingValues.indexOf(selectedDay);

          let counts = ['billing', 'nonbilling'].map(name => myLayers.findBy('name', name).values.mapProperty('y'));

          d3.select('.tooltip-group').attr("transform", `translate(${xScale(pos)}, 0)`);
          d3.select('.tooltip-label .text').text(fmt(date));
          d3.select('.tooltip-label').attr('transform', function() {
            let labelPosition;
            let yPosition = yScale(selectedDay.y);
            let clearance = height - yPosition;
            if (clearance < 100) {
              labelPosition = 200;
            } else {
              labelPosition = 320;
            }
            return `translate(-40, ${labelPosition})`;
          });
          d3.select('.tooltip-circle').attr('transform', function() {
            let labelPosition;
            let yPosition = yScale(selectedDay.y);
            let clearance = height - yPosition;
            if (clearance < 40) {
              labelPosition = 350;
            } else {
              labelPosition = yPosition;
            }
            return `translate(0, ${labelPosition})`;
          });
          let percentage = calculateUtilization(counts, dayIndex) || 0;
          return d3.select('.tooltip-circle .text').text(percentage + "%");
        };

        ruleEnter.append("rect").attr("class", "listener")
          .attr("height", height);
        // .style("opacity", 0)
        xRule.select("rect.listener")
          .on("mouseover", setTooltipPosition)
          .on("click", function(...args) {
            let [p, d] = Array.from(args[0]);
            return emberParent.sendAction('datePicked', moment(d).format("YYYY-MM-DD"));
          });

        xRule.transition().attr("transform", function(...args) { let [pos, date] = Array.from(args[0]); return `translate(${xScale(pos)}, 0)`; });
        let dayWidth = xScale(1);
        xRule.select(".listener")
          .attr("width", dayWidth)
          .attr("x", -dayWidth/2);
        xRule.exit().remove();
        //
        // create tooltip
        if (svg.select(".tooltip-group").empty()) {
          let tooltipGroup = svg.append('g').attr("class", "tooltip-group");
          tooltipGroup.append("svg:line").attr("y2", height).attr('class', 'tooltip-line');
          let tooltipCircle = tooltipGroup.append('g').attr('class', 'tooltip-circle');
          tooltipCircle.append('svg:circle').attr('r', 30);
          tooltipCircle.append('svg:text').attr("class", "text")
            .attr("fill", "white")
            .attr("y", 7);

          let tooltipLabel = tooltipGroup.append("svg:g").attr("class", "tooltip-label")
            .attr("transform", "translate(-40, 320)");
          tooltipLabel.append("svg:rect")
            .attr("width", 80)
            .attr("height", 40)
            .attr("fill", "white")
            .attr("y", 4)
            .attr("x", -4);
          tooltipLabel.append("svg:rect")
            .attr("class", "date-label")
            .attr("width", 80)
            .attr("height", 40);
          tooltipLabel.append("svg:text")
            .attr("fill", "white")
            .attr("class", "text")
            .attr("y", 26)
            .attr("x", 38);
        }


        //add create week label groups
        let mondays = daysAndTicks.filter(function(...args){
          let [pos, date] = Array.from(args[0]);
          return moment(date).day() === 1;
        });


        let weekLabels = svg.selectAll("g.week-label")
          .data(mondays);
        let newLabels = weekLabels.enter().append("svg:g")
          .attr("class", "week-label");
        newLabels.append("svg:rect")
          .attr("width", 80)
          .attr("height", 40)
          .attr("class", "shadow-label")
          .attr("fill", "white")
          .attr("y", 4)
          .attr("x", -4);
        newLabels.append("svg:rect")
          .attr("width", 80)
          .attr("height", 40);
        newLabels.append("svg:text")
          .attr("fill", "white")
          .attr("y", 26)
          .attr("x", 38);

        weekLabels.select("text")
          .text(d => moment(d[1]).format("MM/DD"));
        weekLabels.transition().attr("transform", d => `translate(${xScale(d[0]) - 40}, 25)`);
        weekLabels.exit().remove();

        let i = days.map(d => fmt(d)).indexOf(fmt(snapDate));
        return setTooltipPosition([i, snapDate]);
      });
    };
  }
})
