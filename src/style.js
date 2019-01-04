import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  move: {
    height: '100%',
    position: 'absolute',
    zIndex: 2,
    right: 0,
  },
  order: {
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  itemBorder: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 28,
    height: 28,
  },
});
