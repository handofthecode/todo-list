Todo = {
  toggleComplete: function() {
    this.complete = this.complete ? false : true;
  },
  update: function(updated) {
    this.title = updated.title;
    this.day = updated.day;
    this.month = updated.month;
    this.year = updated.year;
    this.description = updated.description;
  },
  displayDate: function() {
    return this.month + '/' + this.year;
  },
  // sortDate: function() {
  //   return +(this.year + '' + this.month);
  // },
  init: function(title, day, month, year, description, id) {
    if (typeof title === 'object') {
      this.title = title.title;
      this.day = title.day;
      this.month = title.month;
      this.year = title.year;
      this.description = title.description;
      this.complete = false;
      this.id = title.id;
    } else {
      this.title = title;
      this.day = day;
      this.month = month;
      this.year = year;
      this.description = description;
      this.complete = false;
      this.id = id;
    }
    return this;
  },
}

TodoList = {
  completed: function() {
    return this.all.filter(todo => {
      return todo.complete;
    });
  },
  notCompleted: function() {
    return this.all.filter(todo => {
      return !todo.complete;
    });
  },
  orderedNavObjects: function(list) {
    var ids = {};
    list = list === 'completed' ? this.completed() : this.all; 
    
    list.forEach(todo => {
      var date = todo.displayDate();
      ids[date] = ids[date] || [];
      ids[date].push(todo.id);
    });
    
    var orderedDates = Object.keys(ids).sort((a, b) => {
      return a.split('/').reverse().join('') - b.split('/').reverse().join('');
    });

    return orderedDates.map(date => {
      var nav = {};
      nav.date = date;
      nav.count = ids[date].length;
      return nav;
    });
  },
  add: function(todo) {
    this.all.push(todo);
  },
  count: function() {
    return this.all.length;
  },
  completedCount: function() {
    return this.completed().length;
  },
  find: function(id) {
    return this.all.find(todo => {
      if (todo.id === id) return true;
    });
  },
  markComplete: function(id) {
    this.find(id).complete = true;
  },
  update: function(id, obj) {
    this.find(id).update(obj);
  },
  toggleComplete: function(id) {
    this.find(id).toggleComplete();
  },
  delete: function(id) {
    this.all = this.all.filter(todo => {
      return todo.id !== id;
    })
  },
  init: function() {
    this.all = [];
    return this;
  }
}

app = {
  registerHandlers: function() {
    this.$addTodo.on('click', this.handleAddTodo.bind(this));
    this.$submit.on('click', this.handleSubmit.bind(this));
    this.$tint.on('click', this.hideForm.bind(this));
    this.$todoDisplay.on('click', '.delete', this.handleDelete.bind(this));
    this.$todoDisplay.on('click', '.todo', this.handleCompleteToggle.bind(this));
    this.$todoDisplay.on('click', '.todo-title', this.handleEdit.bind(this));
    this.$markAsComplete.on('click', this.handleFormMarkComplete.bind(this));
    $('header').on('click', this.handleNavSelect.bind(this));
  },
  handleNavSelect: function(e) {
    console.log(e.target);
  },
  handleFormMarkComplete: function() {
    var id = +this.getFormID();
    console.log(id);
    if (id === 0) {
      alert('Cannot mark as complete as item has not been created yet!');
    } else {
      this.todoList.markComplete(id);
      this.renderUpdate();
      this.hideForm();
    }
  },
  handleEdit: function(e) {
    e.stopPropagation();
    var id = this.todoIdFromEvent(e);
    var todo = this.todoList.find(id)
    this.populateForm(todo);
    this.showForm();
  },
  populateForm: function(todo) {
    this.$title.val(todo.title);
    this.$day.val(todo.day);
    this.$month.val(todo.month);
    this.$year.val(todo.year);
    this.$description.val(todo.description);
    this.setFormID(todo.id);
  },
  todoIdFromEvent: function(event) {
    return +event.target.closest('.todo').dataset.id;
  },
  handleCompleteToggle: function(e) {
    var id = this.todoIdFromEvent(e);
    this.todoList.toggleComplete(id);
    this.renderUpdate();
  },
  handleDelete: function(e) {
    e.stopPropagation();
    var id = this.todoIdFromEvent(e);
    this.todoList.delete(id);
    this.renderUpdate();
  },
  getFormValues: function() {
    return { title: this.$title.val(),
             day: this.$day.val(), 
             month: this.$month.val(),
             year: this.$year.val(),
             description: this.$description.val()
           };       
  },
  getFormID: function() {
    return this.$form[0].dataset.editId;
  },
  setFormID: function(id) {
    this.$form[0].dataset.editId = id;
  },
  handleSubmit: function() {
    var id = +this.getFormID();
    var properties = this.getFormValues();
    var todo;
    if (id === 0) {
      properties.id = this.serialID++;
      todo = Object.create(Todo).init(properties);
      this.todoList.add(todo);
    } else {
      this.todoList.update(id, properties);
      this.setFormID(0);
    }
    this.hideForm();
    this.renderUpdate();
  },
  renderUpdate: function() {
    this.clearDisplay();
    this.updateTodoCount();
    this.updateNav();
    this.renderDisplay();
    this.renderNav();
  },
  // NAV //
  updateNav: function() {
    this.clearNav();
    this.allTodosNav = this.todoList.orderedNavObjects();
    this.completedTodosNav = this.todoList.orderedNavObjects('completed');
  },
  renderNav: function() {
    this.allTodosNav.forEach(nav => this.appendNav(nav, this.$navTodoList));;
    this.completedTodosNav.forEach(nav => this.appendNav(nav, this.$navCompletedList));
  },
  appendNav: function(context, list) {
    var element = this.createTemplate(this.navTemplate, context);
    list.append(element);
  },
  clearNav: function() {
    this.$navTodoList.children().remove();
    this.$navCompletedList.children().remove();
  },
  // DISPLAY //
  renderDisplay: function() {
    this.todoList.notCompleted().forEach(todo => this.appendTodo(todo))
    this.todoList.completed().forEach(todo => this.appendTodo(todo));
  },
  appendTodo: function(todo) {
    var element = this.createTemplate(this.todoTemplate, todo);
    this.$todoDisplay.append(element);
  },
  updateTodoCount: function() {
    this.$todoCounts.html(this.todoList.count());
    this.$completedCount.html(this.todoList.completedCount());
  },
  clearDisplay: function() {
    this.$todoDisplay.children().remove();
  },
  handleAddTodo: function() {
    this.clearForm();
    this.showForm();
  },
  clearForm: function() {
    this.$title.val('');
    this.$day.val('');
    this.$month.val('');
    this.$year.val('');
    this.$description.val('');
  },
  showForm: function() {
    this.$tint.fadeIn();
    this.$modal.fadeIn();
  },
  hideForm: function() {
    this.$tint.fadeOut();
    this.$modal.fadeOut();
  },
  createTemplate(source, context) {
    var template = Handlebars.compile(source);
    return template(context);
  },
  init: function() {
    this.todoList = Object.create(TodoList).init();
    this.allTodosNav = [];
    this.completedTodosNav = [];

    this.todoTemplate = $('#todo-template').html();
    this.navTemplate = $('#nav-template').html();
    
    // BUTTONS
    this.$addTodo = $('#add_todo');

    this.$todoDisplay = $('#todo-display');
    this.$navTodoList = $('#nav-todo-list');
    this.$navCompletedList = $('#nav-completed-list');

    this.$todoCounts = $('.todo-count');
    this.$completedCount = $('#completed-count');

    this.$modal = $('#modal');
    this.$tint = $('#tint');

    // FORM ELEMENTS //
    this.$title = $('#title');
    this.$day = $('#day');
    this.$month = $('#month');
    this.$year = $('#year');
    this.$description = $('#description')
    this.$submit = $('#submit');
    this.$markAsComplete = $('#mark-as-complete');
    this.$form = $('form');

    this.serialID = 1;
    this.registerHandlers();
  }
}

app.init();