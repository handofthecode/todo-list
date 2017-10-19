Todo = {
  toggleComplete: function() {
    this.complete = this.complete ? false : true;
  },
  init: function(title, day, month, year, description, id) {
    this.title = title;
    this.day = day;
    this.month = month;
    this.year = year;
    this.description = description;
    this.complete = false;
    this.id = id;
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
  sortByDate: function() {
    var sorted = {};
    this.all.forEach(todo => {
      var date = todo.month + '/' + todo.year;
      sorted[date] = sorted[date] || [];
      sorted[date] = todo;
    });
    return sorted;
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
  toggleComplete: function(id) {
    console.log(this.find(id).toggleComplete());
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
    this.$tint.on('click', this.handleCloseModal.bind(this));
    this.$todoDisplay.on('click', '.delete', this.handleDelete.bind(this));
    this.$todoDisplay.on('click', '.todo', this.handleCompleteToggle.bind(this));
    this.$todoDisplay.on('click', '.todo-title', this.handleEdit.bind(this));
  },
  handleEdit: function() {
    e.stopPropagation();
    this.showForm();
  },
  handleCompleteToggle: function(e) {
    var id = e.target.closest('.todo').dataset.id;
    this.todoList.toggleComplete(+id);
    this.renderUpdate();
  },
  handleDelete: function(e) {
    e.stopPropagation();
    var id = e.target.closest('.todo').dataset.id;
    this.todoList.delete(+id);
    this.renderUpdate();
  },
  handleCloseModal: function() {
    this.hideForm();
  },
  handleSubmit: function() {
    var todo = Object.create(Todo).init(this.$title.val(),
                                           this.$day.val(), 
                                           this.$month.val(),
                                           this.$year.val(),
                                           this.$description.val(),
                                           this.serialID++);
    this.todoList.add(todo);
    this.hideForm();
    this.renderUpdate();
  },
  renderUpdate: function() {
    this.clearDisplay();
    this.updateTodoCount();
    this.renderList();
  },
  updateTodoCount: function() {
    this.$todoCounts.html(this.todoList.count());
    console.log(this.$completedCount);
    this.$completedCount.html(this.todoList.completedCount());
  },
  clearDisplay: function() {
    this.$todoDisplay.children().remove();
  },
  renderList: function() {
    this.todoList.notCompleted().forEach(todo => {
      var element = this.createTemplate(this.todoTemplate, todo);
      this.$todoDisplay.append(element);
    })
    this.todoList.completed().forEach(todo => {
      var element = this.createTemplate(this.todoTemplate, todo);
      this.$todoDisplay.append(element);
    })
  },
  handleAddTodo: function() {
    this.showForm();
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
    this.todoTemplate = $('#todo-template').html();
    
    // BUTTONS
    this.$addTodo = $('#add_todo');

    this.$todoDisplay = $('#todo-display');
    this.$todoCounts = $('.todo-count');
    this.$completedCount = $('#completed-count');

    this.$modal = $('#modal');
    this.$tint = $('#tint');
    this.$markAsComplete = $('#mark-as-complete');

    // FORM ELEMENTS //
    this.$title = $('#title');
    this.$day = $('#day');
    this.$month = $('#month');
    this.$year = $('#year');
    this.$description = $('#description')
    this.$submit = $('#submit');

    this.serialID = 1;
    this.registerHandlers();
  }
}

app.init();