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
  truncYear: function() {
    return this.year % 100;
  },
  displayDate: function() {
    if (this.month && this.year) {
      return this.month + '/' + this.truncYear();
    } else {
      return 'No Date Due';
    }
  },
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
    return this.match('complete', true);
  },
  notCompleted: function() {
    return this.match('complete', false);
  },
  match: function(prop, val, completed) {
    completed = completed === 'completed' ? this.completed() : this.all; 
    return completed.filter(todo => {
      return todo[prop] === val;
    });
  },
  matchDate: function(date, completed) {
    completed = completed === 'completed' ? this.completed() : this.all; 
    return completed.filter(todo => {
      return todo.displayDate() === date;
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
  todoDisplay: function(list) {
    if (list === 'completed') {
      list = this.completed()
    } else if (list === undefined) {
      list = this.notCompleted(); 
    } // otherwise list is array //

    return list.map(todo => {
      return {
        id: todo.id,
        date: todo.displayDate(),
        title: todo.title,
        complete: todo.complete,
      }
    })
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
    $('header').on('click', '.nav', this.handleNavSelect.bind(this));
  },
  // UI //
  handleEdit: function(e) {
    e.stopPropagation();
    var id = this.todoIdFromEvent(e);
    var todo = this.todoList.find(id)
    this.populateForm(todo);
    this.showForm();
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
    this.updateTodoCount();
    this.updateNav();
    this.renderNav();
    this.clearDisplay();
    this.refreshDisplay();
  },
  // NAV //
  handleNavSelect: function(e) {
    var $nav = $(e.target).closest('.nav');
    var navId = $nav[0].dataset.navId
    this.clearDisplay();
    if (navId === 'All Todos') {
      this.renderAllTodos();
    } else if (navId === 'Completed') {
      this.renderCompletedTodos();
    } else {
      this.renderNavGroup($nav, navId);
    }

    $('.nav_selected').removeClass('nav_selected');
    $nav.addClass('nav_selected');
    this.$heading.html(navId);
  },
  renderNavGroup: function($nav, navId) {
    var list;
    if (this.inCompletedNav($nav)) {
      list = this.todoList.matchDate(navId, 'completed');
    } else {
      list = this.todoList.matchDate(navId);
    };

    list = this.todoList.todoDisplay(list);
    this.renderListToDisplay(list);
  },
  refreshDisplay: function() {
    // needs refactor
    var navId = this.selectedNavId;
    var $nav = $('[data-nav-id="' + navId + '"]');
    
    $nav.each((i, el) => {
      if (this.inCompletedNav($(el)) === this.selectedNavIsCompleted) {
        el.classList.add('nav_selected');
        $nav = $(el);
      }
    });
    this.clearDisplay();
    if (navId === 'All Todos') {
      this.renderAllTodos();
    } else if (navId === 'Completed') {
      this.renderCompletedTodos();
    } else {
      this.renderNavGroup($nav, navId);
    }
  },
  updateNav: function() {
    if ($('.nav_selected').length !== 0) this.storeSelectedNavGroup();
    this.clearNav();
    this.allTodosNav = this.todoList.orderedNavObjects();
    this.completedTodosNav = this.todoList.orderedNavObjects('completed');
  },
  storeSelectedNavGroup: function() {
    var $selected = $('.nav_selected');
    this.selectedNavId = $selected[0].dataset.navId;
    this.selectedNavIsCompleted = this.inCompletedNav($selected);
    console.dir(this.selectedNavId);
    console.log(this.selectedNavIsCompleted);
  },
  inCompletedNav: function($nav) {
    return $.contains(this.$navCompletedList[0], $nav[0]);
  },
  // NAV DISPLAY //
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
  // TODOS DISPLAY //
  renderAllTodos: function() {
    this.renderListToDisplay(this.todoList.todoDisplay());
    this.renderCompletedTodos();
  },
  renderCompletedTodos: function() {
    this.renderListToDisplay(this.todoList.todoDisplay('completed'));
  },
  renderListToDisplay:function(list) {
    list.forEach(todo => this.appendTodo(todo));
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
  // FORM //
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
    this.setFormID(0);
    this.$tint.fadeOut();
    this.$modal.fadeOut();
  },
  handleFormMarkComplete: function() {
    var id = +this.getFormID();
    if (id === 0) {
      alert('Cannot mark as complete as item has not been created yet!');
    } else {
      this.todoList.markComplete(id);
      this.renderUpdate();
      this.hideForm();
    }
  },
  getFormValues: function() {
    var month = this.$month.val();
    month = month.length === 1 ? month.padStart(2, "0") : month;
    return { title: this.$title.val(),
             day: this.$day.val(), 
             month: month,
             year: this.$year.val(),
             description: this.$description.val(),
           };       
  },
  populateForm: function(todo) {
    this.$title.val(todo.title);
    this.$day.val(todo.day);
    this.$month.val(todo.month);
    this.$year.val(todo.year);
    this.$description.val(todo.description);
    this.setFormID(todo.id);
  },
  // HELPERS //
  createTemplate(source, context) {
    var template = Handlebars.compile(source);
    return template(context);
  },
  todoIdFromEvent: function(event) {
    return +event.target.closest('.todo').dataset.id;
  },
  getFormID: function() {
    return this.$form[0].dataset.editId;
  },
  setFormID: function(id) {
    this.$form[0].dataset.editId = id;
  },
  init: function() {
    this.todoList = Object.create(TodoList).init();
    this.allTodosNav = [];
    this.completedTodosNav = [];

    this.todoTemplate = $('#todo-template').html();
    this.navTemplate = $('#nav-template').html();
    
    this.$addTodo = $('#add_todo');
    this.$heading = $('#heading');
    this$allTodos = $('#all-todos');

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