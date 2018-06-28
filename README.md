# Echarts-react
基于echarts封装的React中可用的图表组件,添加了一些自定义的功能,现已加入在一块区域上可用全屏放大图表的自定义功能(传入fullScreen参数,reference为全屏参照对象的选择器),
后续用到会再添加,默认tooltip工具栏是鼠标悬停到图表上显示,移出图表隐藏
需要先引入echarts并传入到组件的props,按需引入echarts所需的组件,如pie\bar\title等
import "echarts/lib/component/tooltip"; 
import "echarts/lib/component/toolbox"; 
import "echarts/lib/component/grid"; 
import "echarts/lib/component/legend"; 
import echarts from "echarts/lib/echarts"; 
 <ECharts
     menuOption={{
     fullScreen: { reference: '.ClassName' }}}
     echarts={echarts}
     option={benchYBGetByBubble}
     elStyle={{
             width: "19%",
             height: "33%",
             position: "absolute",
             top: "0",
             right: "20%"
             }}
  />	
  组件参数说明:
    option: PropTypes.object, //图表option
    extraOption: PropTypes.object, //图表额外配置
    elStyle: PropTypes.object, //图表容器样式
    theme: PropTypes.string, //默认只有light和dark,其他颜色需要额外载入
    showLoading: PropTypes.bool, //是否显示图表的等待状态
    events: PropTypes.object, //绑定的事件,参数形如{click:(params)=>{}}
    callback: PropTypes.func, //回调函数,可以在其中绑定未列出的事件
    menuOption: PropTypes.object, //头部菜单选项,可配置按钮,若已有功能不足,可以传入额外的按钮配置,是否全屏传入对象(reference为全屏的参照对象),其他     传入对应的方法
    toolboxMode: PropTypes.string, //图表工具栏显示选项,可选show一直显示,hover鼠标悬浮显示,none不显示,
    legendMode: PropTypes.string //图例显示选项,可选show一直显示,hover鼠标悬浮显示,none不显示,
