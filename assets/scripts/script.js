Todo = {
  complete: function() {
    this.complete = true;
  },
  incomplete: function() {
    this.complete = false;
  },
  init: function(title, day, month, year, description, id) {
    this.name = title;
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
  },
  handleCloseModal: function() {
    this.hideForm();
  },
  handleSubmit: function() {
    var todo = Object.create(Todo).init(this.$title.val(),
                                           this.$day.val(), 
                                           this.$month.val(),
                                           this.$year.val(),
                                           this.$description.val());
    this.todoList.add(todo);
    this.hideForm();
    this.renderList();
  },
  renderList: function() {
    this.todoList.all.forEach(todo => {
      this.createTemplate(todo);
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
    this.$addTodo = $('#add_todo');
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