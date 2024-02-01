import { useSelector } from 'react-redux';
import { selectInfo } from '../reducer/info';
import { LoginStatus } from 'redux/types/reducerTypes';
import { getConfigInfo } from 'redux/reducer/configInfo';
import {
  getChessboardData,
  getImageResources,
  getResetStart,
  getCurChessboardNode,
  getChessboardTotalStep,
  getCheckerboardCounts,
  getBtnImageResources,
} from 'redux/reducer/chessboardData';

const useGetState = () => {
  const infoState = useSelector(selectInfo);
  const configInfo = useSelector(getConfigInfo);
  const chessBoardInfo = useSelector(getChessboardData);
  const imageResources = useSelector(getImageResources);
  const btnImageResources = useSelector(getBtnImageResources);
  const resetStart = useSelector(getResetStart);
  const curChessboardNode = useSelector(getCurChessboardNode);
  const chessboardTotalStep = useSelector(getChessboardTotalStep);
  const checkerboardCounts = useSelector(getCheckerboardCounts);

  return {
    isMobile: infoState.isMobile,
    isLogin: infoState.loginStatus === LoginStatus.LOGGED,
    isLock: infoState.loginStatus === LoginStatus.LOCK,
    walletType: infoState.walletType,
    walletInfo: infoState.walletInfo,
    assetVisible: infoState.assetVisible,
    playerInfo: infoState.playerInfo,
    gameSetting: infoState.gameSetting,
    needSync: infoState.isNeedSyncAccountInfo,
    curBeanPass: infoState.curBeanPass,
    configInfo,
    chessBoardInfo,
    imageResources,
    btnImageResources,
    resetStart,
    curChessboardNode,
    chessboardTotalStep,
    checkerboardCounts,
  };
};

export default useGetState;
