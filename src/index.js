import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, PanResponder, findNodeHandle, UIManager, Animated, View, Image } from 'react-native';
import { ORDER } from './images';
import styles from './style';

/**
 * 排序列表
 */
class OrderFlatList extends React.Component {
  static propTypes = {
    // 样式
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    // 排序样式
    orderStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array, PropTypes.func]),
    // 排序按钮宽
    orderWidth: PropTypes.number,
    // 图标
    icon: PropTypes.number,
    // 图标样式
    iconStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    // 获取列表ref
    getListRef: PropTypes.func,
    // 列表项高度
    itemHeight: PropTypes.number.isRequired,
    // 列表排序字段
    orderKeyName: PropTypes.string,
    // 是否排序
    isOrder: PropTypes.bool,
    /**
     * 排序
     * @param 排序结果信息
     * {
     *    // 排序字段(,分隔)
     *    orderKeys,
     *    // 列表
     *    list,
     *    // 排序项字段
     *    orderItemKey,
     *    // 移动项字段
     *    moveItemKey,
     *    // 排序项位置
     *    orderItemIndex,
     *    // 移动项位置
     *    moveItemIndex
     * }
     */
    onOrder: PropTypes.func.isRequired,
    onScroll: PropTypes.func,
    // 渲染帧时间(ms) (优化性能)
    renderFrameTime: PropTypes.number,
  }

  static defaultProps = {
    style: null,
    orderStyle: null,
    orderWidth: 28 + 16,
    icon: ORDER,
    iconStyle: null,
    getListRef: () => {},
    orderKeyName: '',
    isOrder: false,
    onScroll: () => {},
    renderFrameTime: 20,
  }

  constructor(props) {
    super(props);

    this.state = {
      // 是否排序
      isOrder: false,
      // 滚动条y偏移高度
      contentOffsetY: 0,
      // 当前排序子项
      orderItem: { item: {}, index: 0 },
      // 当前移动子项
      moveItem: { item: {}, index: 0 },
      // 当前移动上边距
      moveItemMarginTop: 0,
    };
    // 是否准备排序
    this.isReadyOrder = false;
    // 移动判断时间
    this.onPanResponderMoveTime = 0;
    // 排序按钮右边距
    this.orderButtonMarginRight = new Animated.Value(this._getOrderButtonMarginRight(props.isOrder));

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onStartShouldSetPanResponderCapture: () => false,

      onPanResponderStart: evt => {
        // 准备排序
        this.isReadyOrder = true;
        // 获取当前排序子项
        const evtPageY = evt.nativeEvent.pageY;
        UIManager.measure(findNodeHandle(this._listRef), (x, y, width, height, pageX, pageY) => {
          const index = Math.ceil((evtPageY - pageY + this.state.contentOffsetY) / this.props.itemHeight) - 1;
          if (index < this.props.data.length && this.isReadyOrder) {
            this.setState({
              isOrder: true,
              orderItem: { item: this.props.data[index], index },
              moveItem: { item: this.props.data[index], index },
              moveItemMarginTop: this._getMoveItemMarginTop(evtPageY - pageY, height),
            });
          }
        });
      },

      onPanResponderMove: evt => {
        const onPanResponderMoveTime = Date.now();
        if (!this.state.isOrder || onPanResponderMoveTime - this.onPanResponderMoveTime <= this.props.renderFrameTime) return;
        this.onPanResponderMoveTime = onPanResponderMoveTime;

        // 获取当前移动子项
        const evtPageY = evt.nativeEvent.pageY;
        UIManager.measure(findNodeHandle(this._listRef), (x, y, width, height, pageX, pageY) => {
          if (!this.isReadyOrder) return;
          let index = Math.ceil((evtPageY - pageY + this.state.contentOffsetY) / this.props.itemHeight) - 1;
          index = index >= this.props.data.length ? this.props.data.length - 1 : index < 0 ? 0 : index;
          this.setState({
            moveItem: { item: this.props.data[index], index },
            moveItemMarginTop: this._getMoveItemMarginTop(evtPageY - pageY, height),
          });
        });
      },

      onPanResponderTerminationRequest: () => false,

      onPanResponderRelease: () => {
        this._onOrder();
      },
    });
  }

  componentWillUpdate(nextProps) {
    // 排序
    if (nextProps.isOrder !== this.props.isOrder) {
      Animated.spring(this.orderButtonMarginRight, {
        toValue: this._getOrderButtonMarginRight(nextProps.isOrder),
        speed: 15,
        bounciness: nextProps.isOrder ? 5 : 0,
      }).start();
    }
  }

  /**
   * 获取移动项上边距
   * @param moveY 移动Y坐标
   * @param listHeight 列表高度
   * @private
   */
  _getMoveItemMarginTop = (moveY, listHeight) => {
    const marginTop = moveY - this.props.itemHeight / 2;
    const maxMarginTop = listHeight - this.props.itemHeight;
    return marginTop < 0 ? 0 : marginTop > maxMarginTop ? maxMarginTop : marginTop;
  }

  /**
   * 获取排序按钮右边距
   * @param isOrder 是否排序
   * @private
   */
  _getOrderButtonMarginRight = isOrder => {
    return isOrder ? 0 : -1 * this.props.orderWidth;
  }

  /**
   * 渲染子项
   */
  _renderItem = ({ item, index }) => {
    let orderStyle = this.props.orderStyle;
    if (typeof this.props.orderStyle === 'function') {
      orderStyle = this.props.orderStyle({ item, index });
    }
    return (
      <View style={styles.itemBorder}>
        <View style={styles.item}>
          {this.props.renderItem({ item, index })}
        </View>
        <Animated.View
          style={[styles.orderButton, orderStyle, { width: this.props.orderWidth, marginRight: this.orderButtonMarginRight }]}
        >
          <Image style={[styles.orderIcon, this.props.iconStyle]} source={this.props.icon}/>
        </Animated.View>
      </View>
    );
  }

  /**
   * 排序
   */
  _onOrder = () => {
    this.isReadyOrder = false;
    if (this.state.orderItem.index !== this.state.moveItem.index) {
      const list = [];
      let orderKeys = '';
      const item = this.props.data[this.state.orderItem.index];
      this.props.data.forEach((v, k) => {
        if (k !== this.state.orderItem.index) {
          if (k === this.state.moveItem.index) {
            if (this.state.orderItem.index < this.state.moveItem.index) {
              list.push(v);
              list.push(item);
              if (this.props.orderKeyName) {
                orderKeys = orderKeys ? `${orderKeys},${v[this.props.orderKeyName]}` : v[this.props.orderKeyName];
                orderKeys += `,${item[this.props.orderKeyName]}`;
              }
            }
            else {
              list.push(item);
              list.push(v);
              if (this.props.orderKeyName) {
                orderKeys = orderKeys ? `${orderKeys},${item[this.props.orderKeyName]}` : item[this.props.orderKeyName];
                orderKeys += `,${v[this.props.orderKeyName]}`;
              }
            }
          }
          else {
            list.push(v);
            if (this.props.orderKeyName) {
              orderKeys = orderKeys ? `${orderKeys},${v[this.props.orderKeyName]}` : v[this.props.orderKeyName];
            }
          }
        }
      });

      this.props.onOrder({
        orderKeys,
        list,
        orderItemKey: this.props.data[this.state.orderItem.index][this.props.orderKeyName],
        moveItemKey: this.props.data[this.state.moveItem.index][this.props.orderKeyName],
        orderItemIndex: this.state.orderItem.index,
        moveItemIndex: this.state.moveItem.index,
      });
    }

    // 重置
    this.setState({
      isOrder: false,
      orderItem: { item: {}, index: 0 },
      moveItem: { item: {}, index: 0 },
      moveItemMarginTop: 0,
    });
  }

  render() {
    // 移动控制
    let move = null;
    // 排序子项指示
    let order = null;
    if (this.props.isOrder) {
      move =
        <View
          style={[styles.move, { width: this.props.orderWidth }]}
          {...this.panResponder.panHandlers}
        />;
    }
    if (this.state.isOrder) {
      order =
        <View
          style={[styles.order, { marginTop: this.state.moveItemMarginTop }]}
        >
          {this._renderItem(this.state.orderItem)}
        </View>;
    }

    return (
      <View style={[styles.container, this.props.style]}>
        {/* 移动控制 */}
        {move}
        {/* 排序子项指示 */}
        {order}
        {/* 子项列表 */}
        <FlatList
          {...this.props}
          style={{}}
          ref={ref => {
            this._listRef = ref;
            this.props.getListRef(ref);
          }}
          scrollEnabled={!this.state.isOrder}
          onScroll={evt => {
            this.setState({ contentOffsetY: evt.nativeEvent.contentOffset.y });
            this.props.onScroll(evt);
          }}
          renderItem={({ item, index }) => {
            const items = [];
            if (this.state.isOrder && index === this.state.moveItem.index) {
              if (index < this.state.orderItem.index) {
                items.push(<View key="show" style={{ height: this.props.itemHeight }}/>);
                items.push(<View key="item">{this._renderItem({ item, index })}</View>);
              }
              else if (index === this.state.orderItem.index) {
                items.push(<View key="show" style={{ height: this.props.itemHeight }}/>);
              }
              else {
                items.push(<View key="item">{this._renderItem({ item, index })}</View>);
                items.push(<View key="show" style={{ height: this.props.itemHeight }}/>);
              }
            }
            else if (!this.state.isOrder || this.state.isOrder && index !== this.state.orderItem.index) {
              items.push(<View key="item">{this._renderItem({ item, index })}</View>);
            }

            return items;
          }}
        />
      </View>
    );
  }
}

export default OrderFlatList;
