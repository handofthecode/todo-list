Todo = {
  complete: function() {
    this.complete = true;
  },
  incomplete: function() {
    this.complete = false;
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
    this.completed.length;
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
  },
  handleDelete: function(e) {
    console.log('test')
    var id = e.target.closest('li').dataset.id;

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
    this.$completedCount.html(this.todoList.completedCount());
  },
  clearDisplay: function() {
    this.$todoDisplay.children().remove();
  },
  renderList: function() {
    this.todoList.all.forEach(todo => {
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