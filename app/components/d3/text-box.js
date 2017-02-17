import Ember from 'ember';
import { ChildMixin } from 'ember-composability-tools';
import shape from "d3-shape";
import drag from 'd3-drag';
import selection from 'd3-selection';
import transition from 'd3-transition';
import { event } from 'd3-selection';

let setAttrs = (sel) => {
  sel.attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', d => d.width)
    .attr('fill', d => d.color)
    .attr('height', d => d.height);
};
export default Ember.Component.extend(ChildMixin, {
  tagName: '',
  selection: null,
  didInsertParent() {
    this._super(...arguments);
    if (this.get('selection')) {
      this.renderElement();
    }
  },

  didUpdateAttrs() {
    this.renderElement();
  },
  renderElement() {
    let dragged = (d) => {
      this.d3Drag(d, event);
    };
    let clicked = (d) => {
      this.d3Click(d, event);
    };
    let rects = this.get('selection');
    let merged = rects.enter()
      .append('rect')
      .call(drag.drag()
                .on("drag", dragged))
      .on("click", clicked)
      .merge(rects)
    if (this.animate) {
      merged.transition().call(setAttrs);
    } else {
      merged.call(setAttrs);
    }
  }
});
