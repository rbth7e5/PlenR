export default class SortedList {
  constructor(lambda) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.compare = lambda;
  }

  isEmpty() {
    return this.head === null;
  }

  clone() {
    let newList = new SortedList(this.compare);
    if (!this.isEmpty()) {
      newList.head = this.head;
      newList.tail = this.tail.clone();
      newList.size = this.size;
    }
    return newList;
  }

  add(item) {
    let newList = new SortedList(this.compare);
    if (this.isEmpty()) {
      newList.head = item;
      newList.tail = new SortedList(this.compare);
    } else if (this.compare(this.head, item) === 0) {
      newList.head = item;
      newList.tail = this.tail.clone();
    } else if (this.compare(this.head, item) > 0) {
      newList.head = item;
      newList.tail = this.clone();
    } else {
      newList.head = this.head;
      newList.tail = this.tail.add(item);
    }
    newList.size = this.size + 1;
    return newList;
  }

  delete(item) {
    if (this.isEmpty()) {
      return new SortedList(this.compare);
    } else if (this.compare(this.head, item) === 0) {
      return this.tail.clone();
    } else {
      let newList = new SortedList(this.compare);
      newList.head = this.head;
      newList.tail = this.tail.delete(item);
      newList.size = this.size - 1;
      return newList;
    }
  }

  forEach(action) {
    if (this.isEmpty()) {
    } else {
      action(this.head);
      this.tail.forEach(action);
    }
    return true;
  }

  map(mapper) {
    if(this.isEmpty()) {
      return new SortedList(this.compare);
    } else {
      let newList = new SortedList(this.compare);
      newList.size = this.size;
      newList.head = mapper(this.head);
      newList.tail = this.tail.map(mapper);
      return newList;
    }
  }

  toArray() {
    let array = [];
    this.forEach(item => array.push(item));
    return array;
  }

  reduce(acc, init) {
    if (this.isEmpty()) {
      return init;
    } else {
      return this.tail.reduce(acc, acc(init, this.head));
    }
  }

  filter(predicate) {
    if (this.isEmpty()) {
      return new SortedList(this.compare);
    } else if (predicate(this.head)) {
      let newList = new SortedList(this.compare);
      newList.head = this.head;
      newList.tail = this.tail.filter(predicate);
      return newList;
    } else {
      return this.tail.filter(predicate);
    }
  }

  static merge(list1, list2) {
    let newList = new SortedList(list1.compare);
    if (list1.isEmpty()) {
      return list2;
    } else if (list2.isEmpty()) {
      return list1;
    } else if (newList.compare(list1.head, list2.head) <= 0) {
      newList.head = list1.head;
      newList.tail = SortedList.merge(list1.tail, list2);
    } else {
      newList.head = list2.head;
      newList.tail = SortedList.merge(list1, list2.tail);
    }
    return newList;
  }
}
