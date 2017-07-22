(function () {
var editor1 = null;
var editor2 = null;

new Vue({
  el: '#app',
  data: {
    list: [],
    curMock: {},
    curOption: {}
  },
  methods: {
    switchMockData: function (mock, option) {
      if (mock.responseKey === option.key) return
      var self = this
      $.ajax({
        url: './update',
        data: {
          mockName: mock.name,
          responseKey: option.key
        },
        dataType: 'json',
        success: function (data) {
          mock.responseKey = option.key
          self.curOption = option
        }
      })
    },
    switchMock: function (mock) {
      this.curMock = mock
      this.curOption = mock.responseOptions[mock.responseKey]
    }
  },
  watch: {
    curOption: function (val, oldVal) {
      if (editor1) {
        editor1.setValue(val.template)
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
