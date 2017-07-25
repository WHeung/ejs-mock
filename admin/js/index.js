(function () {
var editor1 = null;
var editor2 = null;

new Vue({
  el: '#app',
  data: {
    list: [],
    curMock: {},
    curOption: {},
    view: 'mock',
    query: ''
  },
  methods: {
    switchMockData: function (mock, option) {
      if (mock.responseKey === option.key) return
      var self = this
      $.ajax({
        url: './update_response_key',
        data: {
          mockName: mock.name,
          responseKey: option.key
        },
        dataType: 'json',
        success: function (data) {
          mock.responseKey = option.key
          self.curOption = mock.responseOptions[option.key]
        }
      })
    },
    switchMock: function (mock) {
      this.curMock = mock
      this.curOption = mock.responseOptions[mock.responseKey]
    },
    addMock: function () {

    },
    addOption: function () {
      
    },
    saveTemplate: function () {
      var val = editor1.getValue()
      var self = this
      $.ajax({
        url: './update_template',
        method: 'POST',
        data: {
          template: val,
          path: self.curOption.path
        },
        dataType: 'json',
        success: function (data) {
          self.curOption.template = val
          alert('save successed!')
        }
      })
    },
    switchView (view) {
      this.view = view
    },
    showData () {
      this.switchView('result')
      $.ajax({
        url: this.curMock.url + `?${this.query}`,
        dataType: 'json',
        success: function (data) {
          editor2.setValue(JSON.stringify(data, null, 2))
        }
      })
    }
  },
  watch: {
    curOption: function (val, oldVal) {
      if (editor1) {
        editor1.setValue(val.template)
      }
      if (editor2 && this.view === 'result') {
        this.showData()
      }
    }
  },
  mounted: function () {
    var self = this
    $.ajax({
      url: './list',
      dataType: 'json',
      success: function (data) {
        self.list = data.data
        self.curMock = self.list[0]
        self.curOption = self.curMock.responseOptions[self.curMock.responseKey]
      }
    })
  }
})

editor1 = CodeMirror.fromTextArea(document.getElementById("editor1"), {
  mode: "application/json",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  theme: 'material'
})

editor2 = CodeMirror.fromTextArea(document.getElementById("editor2"), {
  mode: "application/json",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  theme: 'material'
})

})()
