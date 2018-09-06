import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import styles from "./ECharts.scss";
export default class ECharts extends React.Component {
  constructor(props) {
    super(props);
    this.initChart = this.initChart.bind(this);
    this.state = {
      isFullScreen: false //是否全屏
    };
    this.handleMovePieceAction = this.handleMovePieceAction.bind(this);
    this.allowMove = false;
  }
  static propTypes = {
    xAxisFixedNumber: PropTypes.number, //当移动坐标轴时格式化显示小数位数
    yAxisFixedNumber: PropTypes.number, //当移动坐标轴时格式化显示小数位数
    showMovePiece: PropTypes.bool, //是否显示调节块
    option: PropTypes.object, //图表option
    extraOption: PropTypes.object, //图表额外配置
    elStyle: PropTypes.object, //图表容器样式
    theme: PropTypes.string, //默认只有light和dark,其他颜色需要额外载入
    showLoading: PropTypes.bool, //是否显示图表的等待状态
    events: PropTypes.object, //绑定的事件,参数形如{click:(params)=>{}}
    callback: PropTypes.func, //回调函数,可以在其中绑定未列出的事件
    showFullscreen: PropTypes.bool, //是否显示全屏按钮
    toolboxMode: PropTypes.string, //图表工具栏显示选项,可选show一直显示,hover鼠标悬浮显示,none不显示,
    legendMode: PropTypes.string //图例显示选项,可选show一直显示,hover鼠标悬浮显示,none不显示,
  };
  static defaultProps = {
    xAxisFixedNumber: 0,
    yAxisFixedNumber: 0,
    showMovePiece: true,
    option: {},
    extraOption: { notMerge: true },
    elStyle: {},
    theme: "default",
    showLoading: false,
    events: {},
    callback: () => {},
    showFullscreen: true,
    toolboxMode: "hover",
    legendMode: "show"
  };
  initChart() {
    const {
      showMovePiece,
      option,
      extraOption,
      theme,
      echarts,
      showLoading,
      events,
      callback,
      showFullscreen,
      toolboxMode,
      legendMode
    } = this.props; //外部传入的data数据
    let toolbox = option.toolbox || { feature: {} };
    let self = this;
    if (showFullscreen) {
      toolbox.feature.myFullScreen = {
        show: true,
        title: "全屏",
        icon:
          "path://M941.248 850.752 730.496 640 640 730.496 850.752 941.248 768 1024 1024 1024 1024 768zM82.752 173.248 293.504 384 384 293.504 173.248 82.752 256 0 0 0 0 256zM850.752 82.752 640 293.504 730.496 384 941.248 173.248 1024 256 1024 0 768 0zM384 730.496 293.504 640 82.752 850.752 0 768 0 1024 256 1024 173.248 941.248z",
        onclick: () => {
          self.handleFullScreen(self);
        }
      };
    }
    toolbox.show = toolboxMode !== "hover";
    option.toolbox = toolbox;
    let myChart = echarts.init(this.ID, theme); //初始化echarts
    if (showLoading) {
      myChart.showLoading();
    } else {
      myChart.hideLoading();
    }
    //设置图例显示
    if (legendMode === "hover") {
      if (option.legend) {
        option.legend.show = false;
      }
    }
    this.option = option;
    //绑定移动事件
    this.xMoveInfo = null;
    this.yMoveInfo = null;
    if (showMovePiece) {
      if (
        option.xAxis &&
        !(option.xAxis instanceof Array) &&
        option.xAxis.type === "value"
      ) {
        self.xMoveInfo = [];
        let func =
          (option.xAxis.axisLabel && option.xAxis.axisLabel.formatter) ||
          function(v) {
            return v.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
          };
        option.xAxis.axisLabel = {
          ...option.xAxis.axisLabel,
          formatter(v, i) {
            if (i === 0) self.yMoveInfo = [];
            self.xMoveInfo.push(v);
            return func(v, i);
          }
        };
      }
      if (
        option.yAxis &&
        !(option.yAxis instanceof Array) &&
        option.yAxis.type !== "category"
      ) {
        self.yMoveInfo = [];
        let func =
          (option.yAxis.axisLabel && option.yAxis.axisLabel.formatter) ||
          function(v) {
            return v.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
          };
        option.yAxis.axisLabel = {
          ...option.yAxis.axisLabel,
          formatter(v, i) {
            if (i === 0) self.yMoveInfo = [];
            self.yMoveInfo.push(v);
            return func(v, i);
          }
        };
      }
    }
    //设置options
    myChart.setOption(option, extraOption);
    //绑定事件
    for (let eventName in events) {
      myChart.off(eventName);
      myChart.on(eventName, events[eventName]);
    }
    this.chart = myChart;
    callback(myChart);
    function resizeChart() {
      myChart.resize();
    }
    $(window).resize(() => {
      this.throttle(resizeChart, 100);
    });
  }
  handleFullScreen(self) {
    self.setState({ isFullScreen: !self.state.isFullScreen });
    function resizeChart(time) {
      $("#subloading").css("display", "");
      setTimeout(() => {
        self.chart.resize();
        $("#subloading").css("display", "none");
      }, time);
    }
    resizeChart(100);
  }
  handleOver() {
    if (
      this.props.toolboxMode === "hover" ||
      this.props.legendMode === "hover"
    ) {
      this.timer = setTimeout(() => {
        let option = {};
        if (this.props.toolboxMode === "hover") {
          option.toolbox = { show: true };
        }
        if (this.props.legendMode === "hover") {
          option.legend = { show: true };
        }
        this.chart.setOption(option);
        clearTimeout(this.timer);
        this.timer = null;
      }, 1000);
    }
  }
  handleLeave() {
    if (
      this.props.toolboxMode === "hover" ||
      this.props.legendMode === "hover"
    ) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      let option = {};
      if (this.props.toolboxMode === "hover") {
        option.toolbox = { show: false };
      }
      if (this.props.legendMode === "hover") {
        option.legend = { show: false };
      }
      this.chart.setOption(option);
    }
  }
  getChart() {
    //返回实例化后的chart引用,从而触发dispatchAction等方法
    return this.chart;
  }
  handleMovePieceAction(e) {
    let { xAxisFixedNumber, yAxisFixedNumber } = this.props;
    let { clientX, clientY } = e;
    this.allowMove = true;
    document.querySelector("body").onmousemove = e1 => {
      if (this.allowMove) {
        let { clientX: clientX1, clientY: clientY1 } = e1;
        this.movePiece.style.left = clientX1 - clientX + "px";
        this.movePiece.style.bottom = clientY - clientY1 + "px";
      }
      this.movePiece.onmouseup = e2 => {
        let { clientX: clientX1, clientY: clientY1 } = e2;
        let diffX = clientX1 - clientX,
          diffY = clientY - clientY1;
        let chartWidth = this.chart.getWidth(),
          chartHeight = this.chart.getHeight();
        if (this.xMoveInfo && Math.abs(diffX) > Math.abs(diffY)) {
          let min =
            this.xMoveInfo[0] +
            diffX /
              chartWidth *
              (this.xMoveInfo[this.xMoveInfo.length - 1] - this.xMoveInfo[0]);
          this.chart.setOption(
            {
              xAxis: {
                ...this.option.xAxis,
                min: min.toFixed(xAxisFixedNumber)
              }
            },
            { notMerge: false }
          );
        } else if (this.yMoveInfo && Math.abs(diffX) < Math.abs(diffY)) {
          let min =
            this.yMoveInfo[0] +
            diffY /
              chartHeight *
              (this.yMoveInfo[this.yMoveInfo.length - 1] - this.yMoveInfo[0]);
          this.chart.setOption(
            {
              yAxis: {
                ...this.option.yAxis,
                min: min.toFixed(yAxisFixedNumber)
              }
            },
            { notMerge: false }
          );
        }
        this.allowMove = false;
        this.movePiece.style.left = "0px";
        this.movePiece.style.bottom = "0px";
      };
    };
  }
 //函数节流方法,用于window.resize()避免无限的resize()执行
  throttle(method, timeout, context) {
    clearTimeout(method.tId);
    method.tId = setTimeout(() => {
      method.call(context);
    }, timeout);
  }
  componentDidMount() {
    this.initChart();
  }
  componentDidUpdate() {
    this.initChart();
  }
  render() {
    const { elStyle, showMovePiece, option } = this.props;
    elStyle.position = elStyle.position || "relative";
    const { isFullScreen } = this.state;
    return (
      <div
        onMouseEnter={this.handleOver.bind(this)}
        onMouseLeave={this.handleLeave.bind(this)}
        style={
          isFullScreen ? (
            {
              position: "fixed",
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
              zIndex: "999",
              top: "0",
              left: "0"
            }
          ) : (
            { ...elStyle }
          )
        }
      >
        {showMovePiece &&
        (option.xAxis &&
          ((!(option.xAxis instanceof Array) &&
            option.xAxis.type === "value") ||
            (!(option.yAxis instanceof Array) &&
              option.yAxis.type !== "category"))) ? (
          <div
            className={styles.movePiece}
            onDoubleClick={e => {
              this.allowMove = false;
              this.chart.setOption(this.option, { notMerge: true });
            }}
            onMouseDown={this.handleMovePieceAction}
            ref={ID => (this.movePiece = ID)}
          />
        ) : null}
        {showMovePiece &&
        (option.xAxis &&
          ((!(option.xAxis instanceof Array) &&
            option.xAxis.type === "value") ||
            (!(option.yAxis instanceof Array) &&
              option.yAxis.type !== "category"))) ? (
          <div
            className={styles.referPiece}
            ref={ID => (this.referPiece = ID)}
          />
        ) : null}
        <div
          ref={ID => (this.ID = ID)}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }
}
