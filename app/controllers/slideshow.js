import Ember from 'ember';

export default Ember.Controller.extend({
  shouldAnimate: true,
  selectedItem: null,
  textBoxes: [
    {
      id: 1,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: 'blue'
    },
    {
      id: 2,
      x: 250,
      y: 50,
      width: 100,
      height: 100,
      color: 'blue'
    }
  ],
  actions: {
    textBoxDragged(box, newCoords) {
      this.set('shouldAnimate', false);
      box.x = newCoords.x;
      box.y = newCoords.y;
      this.notifyPropertyChange('textBoxes');
    },
    textBoxSelected(box) {
      this.set('selectedItem', box);
    },
    clearSelection(item) {
      this.set('selectedItem', null);
    },
    randomize() {
      let max = 300;
      let min = 0;
      let makeRandom = () => {
        return Math.floor(Math.random() * (max - min)) + min;
      };

      this.set('shouldAnimate', true);
      this.get('textBoxes').forEach((b) => {
        b.x = makeRandom();
        b.y = makeRandom();
      });
      this.notifyPropertyChange('textBoxes');
    }
  }
});
