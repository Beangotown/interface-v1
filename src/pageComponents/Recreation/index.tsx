import { useCallback, useEffect, useRef, useState } from 'react';

import { CheckerboardNode, CheckerboardType, IJumpCallbackParams } from './checkerboard';
import { CheckerboardList } from './checkerboard';
import styles from './index.module.css';

import Checkerboard from './components/Checkerboard';
import SideBorder from './components/SideBorder';
import Role from './components/Role';

import Board from './components/Board';
import GoButton, { Status } from './components/GoButton';
import { ANIMATION_DURATION } from 'constants/animation';
import useGetState from 'redux/state/useGetState';
import RecreationModal, { RecreationModalType } from './components/RecreationModal';
import { useDebounce, useDeepCompareEffect, useEffectOnce, useWindowSize } from 'react-use';
import { BeanPassItemType, GetBeanPassStatus, ShowBeanPassType } from 'components/CommonModal/type';
import GetBeanPassModal from 'components/CommonModal/GetBeanPassModal';
import { useAddress } from 'hooks/useAddress';
import { useRouter } from 'next/navigation';
import { receiveBeanPassNFT } from 'api/request';
import useWebLogin from 'hooks/useWebLogin';
import showMessage from 'utils/setGlobalComponentsInfo';
import BoardLeft from './components/BoardLeft';
import { setCurBeanPass, setPlayerInfo } from 'redux/reducer/info';
import { IContractError, WalletType } from 'types';
import ShowNFTModal from 'components/CommonModal/ShowNFTModal';
import CountDownModal from 'components/CommonModal/CountDownModal';
import { dispatch, store } from 'redux/store';
import { TargetErrorType, formatErrorMsg } from 'utils/formattError';
import { sleep } from 'utils/common';
import { setChessboardResetStart, setChessboardTotalStep, setCurChessboardNode } from 'redux/reducer/chessboardData';
import { getTxResultRetry } from 'utils/getTxResult';
import { ChainId } from '@portkey/types';
import { getList } from './utils/getList';
import BoardRight from './components/BoardRight';
import { SECONDS_60 } from 'constants/time';
import { getModalInfo } from './utils/getModalInfo';
import { DEFAULT_SYMBOL, RoleImg } from 'constants/role';
import { getBeanPassModalType } from './utils/getBeanPassModalType';
import { setNoticeModal } from 'redux/reducer/noticeModal';
import GlobalCom from './components/GlobalCom';
import CheckerboardBottom from './components/CheckerboardBottom';
import play from './utils/play';

export default function Game() {
  const [translate, setTranslate] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const { width, height } = useWindowSize();
  const address = useAddress();
  const router = useRouter();
  const { initializeContract, updatePlayerInformation, syncAccountInfo } = useWebLogin({});

  const {
    isMobile,
    isLogin,
    playerInfo,
    walletType,
    walletInfo,
    configInfo,
    chessBoardInfo: checkerboardData,
    resetStart: chessboardResetStart,
    chessboardTotalStep,
    curChessboardNode,
    needSync,
    checkerboardCounts,
    curBeanPass,
  } = useGetState();

  const [beanPassInfoDto, setBeanPassInfoDto] = useState<BeanPassItemType>();

  const firstNode = checkerboardData![5][4];
  const firstNodePosition: [number, number] = [5, 4];
  const linkedList = useRef<CheckerboardList>();

  const currentNodeRef = useRef<CheckerboardNode>();
  const checkerboardContainerRef = useRef<HTMLDivElement>(null);
  const [checkerboardContainerWidth, setCheckerboardContainerWidth] = useState<number>();
  const [score, setScore] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);
  const [diceType, setDiceType] = useState<RecreationModalType>(RecreationModalType.LOADING);
  const [treasureOpen, setTreasureOpen] = useState<boolean>(false);

  const [playableCount, setPlayableCount] = useState<number>(0);
  const [sumScore] = useState<number>(configInfo!.sumScore);
  const [hasNft, setHasNft] = useState<boolean>(false);
  const [resetStart, setResetStart] = useState<boolean>(true);
  const [totalStep, setTotalStep] = useState<number>(0);
  const [step, setStep] = useState<number>(0);

  const [goLoading, setGoLoading] = useState<boolean>(false);
  const [moving, setMoving] = useState<boolean>(false);
  const [goStatus, setGoStatus] = useState<Status>(Status.DISABLED);
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const [beanPassModalVisible, setBeanPassModalVisible] = useState(false);

  const [beanPassModalType, setBeanPassModalType] = useState<GetBeanPassStatus>(GetBeanPassStatus.Abled);

  const [isShowNFT, setIsShowNFT] = useState(false);
  const [nftModalType, setNFTModalType] = useState<ShowBeanPassType>(ShowBeanPassType.Display);

  const [opacity, setOpacity] = useState<number>(0);
  const [roleAnimationDuration, setRoleAnimationDuration] = useState<number>(0);

  const [countDownModalOpen, setCountDownModalOpen] = useState(false);

  const [curDiceCount, setCurDiceCount] = useState<number>(1);
  const [diceNumbers, setDiceNumbers] = useState<number[]>([]);

  const translateRef = useRef<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });

  const updateStep = () => {
    store.dispatch(
      setPlayerInfo({
        ...playerInfo,
        playableCount: playerInfo?.playableCount && playerInfo?.playableCount > 0 ? playerInfo.playableCount - 1 : 0,
      }),
    );
  };

  const updateTotalStep = (totalStep: number) => {
    store.dispatch(setChessboardTotalStep(totalStep));
    setTotalStep(totalStep);
  };

  const updatePosition = ({ x, y, state, currentNode }: IJumpCallbackParams) => {
    setTranslate({
      x: x,
      y: y,
    });
    if (!state) {
      const timer = setTimeout(() => {
        setGoLoading(false);
        setMoving(false);
        clearTimeout(timer);
        if (currentNode) {
          currentNodeRef.current = currentNode;
          store.dispatch(setCurChessboardNode(currentNode));
          if (currentNode.info.info.type === CheckerboardType.TREASURE) {
            setTreasureOpen(true);
          } else {
            updatePlayerInformation(address);
            setShowAdd(true);
          }
        }
      }, ANIMATION_DURATION);
    }
  };

  const jump = (step: number) => {
    if (linkedList.current) {
      const next = linkedList.current.jump({
        step,
        // animation: animationRef.current!,
        baseWidth: translateRef.current.x,
        baseHeight: translateRef.current.y,
      });
      next(({ x, y, state, currentNode }) =>
        updatePosition({
          x,
          y,
          state,
          currentNode,
        }),
      );
    }
  };

  const hideAdd = () => {
    setShowAdd(false);
  };

  const resetPosition = () => {
    setTranslate({
      x: ((currentNodeRef.current?.info.column ?? 4) - 4) * translateRef.current.x,
      y: ((currentNodeRef.current?.info.row ?? 5) - 5) * translateRef.current.y,
    });
  };

  const initCheckerboard = () => {
    resetPosition();
    setResetStart(chessboardResetStart);
    setTotalStep(chessboardTotalStep);
    store.dispatch(setChessboardResetStart(chessboardResetStart));
    store.dispatch(setChessboardTotalStep(chessboardTotalStep));
    // animationRef.current?.pause();
    translateRef.current = {
      x: document.getElementById('animationId')?.clientWidth || 0,
      y: document.getElementById('animationId')?.clientHeight || 0,
    };
    linkedList.current = new CheckerboardList({
      baseWidth: translateRef.current.x,
      baseHeight: translateRef.current.y,
      animationDuration: ANIMATION_DURATION,
    });

    if (curChessboardNode) {
      linkedList.current.updateCurrentNode(curChessboardNode);
    }

    getList(firstNode, firstNodePosition, checkerboardData!, linkedList, firstNodePosition);
  };

  const updateCheckerboard = () => {
    setRoleAnimationDuration(0);
    translateRef.current = {
      x: document.getElementById('animationId')?.clientWidth || 0,
      y: document.getElementById('animationId')?.clientHeight || 0,
    };
    resetPosition();
    linkedList.current?.resize(translateRef.current.x, translateRef.current.y);
  };
  const windowChange = () => {
    if (checkerboardContainerRef) {
      setCheckerboardContainerWidth(checkerboardContainerRef.current?.clientWidth);
    }
  };
  useDebounce(windowChange, 500, [width, height]);
  useEffect(() => {
    updateCheckerboard();
  }, [checkerboardContainerWidth]);

  const go = async () => {
    if (goStatus !== Status.NONE) {
      if (!hasNft) {
        onNftClick();
        return;
      }
      if (hasNft && playableCount === 0) {
        setCountDownModalOpen(true);
        return;
      }
      return;
    }
    try {
      setGoLoading(true);
      setDiceType(RecreationModalType.LOADING);
      setOpen(true);
      const bingoRes = await play({
        resetStart,
        diceCount: curDiceCount,
      });
      updateStep();
      setResetStart(false);
      store.dispatch(setChessboardResetStart(false));
      if (bingoRes) {
        const bingoStep = bingoRes.gridNum;
        if (bingoRes.startGridNum !== totalStep) {
          const stepDifference = (bingoRes.startGridNum + checkerboardCounts - totalStep) % checkerboardCounts;
          for (let index = 0; index < stepDifference; index++) {
            currentNodeRef.current = currentNodeRef.current?.next || linkedList.current?.head || undefined;
          }
          linkedList.current?.updateCurrentNode(currentNodeRef.current || null);
          updateCheckerboard();
        }
        updateTotalStep(bingoRes.endGridNum);
        setRoleAnimationDuration(ANIMATION_DURATION);
        setScore(bingoRes.score);
        setStep(bingoStep);
        setDiceNumbers(bingoRes.diceNumbers);
        setDiceType(RecreationModalType.DICE);
      }
    } catch (error) {
      console.error('=====error', error);
      const resError = error as IContractError;
      showMessage.error(formatErrorMsg(resError)?.errorMessage?.message);
      setMoving(false);
      setOpen(false);
      updatePlayerInformation(address);
    }
    setGoLoading(false);
  };

  const doubleClaimCallback = () => {
    dispatch(
      setNoticeModal({
        onCancel: () => {
          dispatch(
            setNoticeModal({
              open: false,
            }),
          );
          setBeanPassModalType(GetBeanPassStatus.Notfound);
          setBeanPassModalVisible(true);
        },
      }),
    );
  };

  const checkBeanPassStatus = useCallback(async () => {
    if (address) {
      showMessage.loading(TargetErrorType.Error7);
      const res = await getBeanPassModalType({ address, doubleClaimCallback, reTryCounts: 4 });
      if (res) {
        setBeanPassModalType(res);
        setBeanPassModalVisible(true);
      }
    }
  }, [address]);

  const handleConfirm = async () => {
    if (beanPassModalType === GetBeanPassStatus.Abled) {
      showMessage.loading();
      const getNFTRes = await receiveBeanPassNFT({
        caAddress: address,
      });
      const { claimable, reason, transactionId, beanPassInfoDto } = getNFTRes;
      if (!claimable) {
        showMessage.error(reason);
        return;
      }
      setBeanPassModalVisible(false);
      setBeanPassInfoDto(beanPassInfoDto);
      setNFTModalType(ShowBeanPassType.Success);

      await sleep(configInfo?.stepUpdateDelay || 3000);
      try {
        await getTxResultRetry({
          TransactionId: transactionId,
          chainId: configInfo?.curChain as ChainId,
          rpcUrl: configInfo!.rpcUrl,
          rePendingEnd: new Date().getTime() + SECONDS_60,
          reNotexistedCount: 5,
        });
        updatePlayerInformation(address);
        setBeanPassInfoDto(beanPassInfoDto);
        setIsShowNFT(true);
        dispatch(
          setCurBeanPass({
            ...beanPassInfoDto,
            owned: true,
            usingBeanPass: true,
          }),
        );
      } catch (error) {
        /* empty */
      }

      showMessage.hideLoading();
    } else if (beanPassModalType === GetBeanPassStatus.Recharge) {
      if (walletType === WalletType.discover || walletType === WalletType.unknown) {
        return;
      }
      router.push('/asset');
    } else {
      setBeanPassModalVisible(false);
    }
  };

  const initContractAndCheckBeanPass = useCallback(async () => {
    await initializeContract();
  }, [initializeContract]);

  const handleHasNft = (hasNft: boolean) => {
    if (hasNft) {
      setHasNft(true);
      setOpacity(1);
      showMessage.hideLoading();
    } else {
      setHasNft(false);
      checkBeanPassStatus();
    }
  };

  useEffect(() => {
    if (isLogin && needSync) {
      syncAccountInfo();
    }
  }, [isLogin, needSync, syncAccountInfo]);

  useEffect(() => {
    if (!isLogin) {
      router.push('/login');
    } else {
      if (walletType !== WalletType.unknown && walletInfo && !needSync) {
        initContractAndCheckBeanPass();
      }
    }
  }, [initContractAndCheckBeanPass, isLogin, needSync, router, walletInfo, walletType]);

  useEffect(() => {
    initCheckerboard();
  }, [checkerboardData, hasNft]);

  useEffectOnce(() => {
    showMessage.loading();

    setResetStart(chessboardResetStart);
    setTotalStep(chessboardTotalStep);
    currentNodeRef.current = curChessboardNode;
    if (curChessboardNode) {
      setOpacity(0);
      updateCheckerboard();
      setTimeout(() => {
        setOpacity(1);
      }, 25);
    }
  });

  useEffect(() => {
    if (address) {
      getModalInfo({
        isHalloween: configInfo?.isHalloween,
        caAddress: address,
      });
    }
  }, [address]);

  useDeepCompareEffect(() => {
    setPlayableCount(playerInfo?.playableCount || 0);
    if (!hasNft || !sumScore || moving) {
      return setGoStatus(Status.DISABLED);
    }
    if (goLoading) {
      setGoStatus(Status.LOADING);
      return;
    }
    if (playerInfo?.playableCount && playerInfo?.playableCount > 0) {
      setGoStatus(Status.NONE);
    } else {
      setGoStatus(Status.DISABLED);
    }
  }, [hasNft, moving, goLoading, playerInfo]);

  const onShowNFTModalCancel = () => {
    if (nftModalType === ShowBeanPassType.Success) {
      handleHasNft(true);
    }
    setIsShowNFT(false);
  };

  const onNftClick = async () => {
    if (hasNft) {
      setNFTModalType(ShowBeanPassType.Display);
      setIsShowNFT(true);
    } else {
      showMessage.loading();
      checkBeanPassStatus();
    }
  };

  const diceModalOnClose = () => {
    setOpen(false);
    setMoving(true);
    setShowAdd(false);
    jump(step);
  };

  const recreationModalOnClose = () => {
    updatePlayerInformation(address);
    setTreasureOpen(false);
  };

  const changeCurDiceCount = (num: number) => {
    setCurDiceCount(num);
  };

  const handleNoneOwned = () => {
    setIsShowNFT(false);
    handleHasNft(false);
    updatePlayerInformation(address);
  };

  useEffect(() => {
    if (playerInfo?.beanPassOwned !== undefined) {
      handleHasNft(playerInfo?.beanPassOwned || false);
    }
  }, [playerInfo?.beanPassOwned, address]);

  return (
    <>
      <div className={`${styles.game} cursor-custom relative z-[1] ${isMobile && 'flex-col'}`}>
        {!isMobile && <BoardLeft />}
        <div
          className={`${styles['game__content']} flex overflow-hidden ${
            isMobile ? 'w-full flex-1' : 'h-full w-[40%] min-w-[500Px] max-w-[784Px]'
          } ${configInfo?.isHalloween && '!bg-[url(/images/recreation/checkerboard-bg.svg)] bg-cover'}`}>
          {isMobile && <Board hasNft={hasNft} onNftClick={onNftClick} />}
          <SideBorder side="left" />
          <div
            ref={checkerboardContainerRef}
            className={`w-full overflow-y-auto overflow-x-hidden ${styles.scrollbar}`}>
            <div className={`relative flex-1 pl-[16px] ${isMobile ? 'pt-[41px]' : 'pt-[80px]'}`}>
              <div className="relative z-[30]">
                <Role
                  id="animationId"
                  width={`calc(100% / ${checkerboardData?.[0]?.length})`}
                  translate={translate}
                  bean={score}
                  opacity={curBeanPass?.symbol ? opacity : 0}
                  position={{
                    x: currentNodeRef.current?.info.row,
                    y: currentNodeRef.current?.info.column,
                  }}
                  animationDuration={roleAnimationDuration}
                  showAdd={showAdd}
                  hideAdd={hideAdd}>
                  {/* <Lottie lottieRef={animationRef} animationData={dataAnimation} /> */}
                  <img className="w-full h-full" src={RoleImg[curBeanPass?.symbol || DEFAULT_SYMBOL]} alt="role" />
                </Role>

                {checkerboardData?.map((row, index) => {
                  return (
                    <div key={index} className="flex">
                      {row.map((column) => {
                        return (
                          <div
                            key={column.id}
                            style={{
                              width: `calc(100% / ${row.length})`,
                            }}>
                            <Checkerboard value={column} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <CheckerboardBottom />
            </div>
          </div>

          <SideBorder side="right" />
        </div>
        {!isMobile && (
          <BoardRight>
            <Board
              hasNft={hasNft}
              onNftClick={onNftClick}
              playableCount={playableCount}
              sumScore={hasNft ? sumScore : 0}
              status={goStatus}
              curDiceCount={curDiceCount}
              changeCurDiceCount={changeCurDiceCount}
              go={go}
            />
          </BoardRight>
        )}

        {isMobile && (
          <GoButton
            playableCount={playableCount}
            sumScore={hasNft ? sumScore : 0}
            status={goStatus}
            curDiceCount={curDiceCount}
            changeCurDiceCount={changeCurDiceCount}
            go={go}
          />
        )}

        <RecreationModal
          open={open}
          onClose={diceModalOnClose}
          diceNumbers={diceNumbers}
          type={diceType}
          step={step}
          curDiceCount={curDiceCount}
        />
        <RecreationModal
          open={treasureOpen}
          onClose={recreationModalOnClose}
          type={RecreationModalType.TREASURE}
          step={step}
          bean={score}
        />
        <GetBeanPassModal
          type={beanPassModalType}
          open={beanPassModalVisible}
          onCancel={() => setBeanPassModalVisible(false)}
          onConfirm={handleConfirm}
        />

        <ShowNFTModal
          open={isShowNFT}
          beanPassItem={beanPassInfoDto}
          onCancel={onShowNFTModalCancel}
          type={nftModalType}
          handleNoneOwned={handleNoneOwned}
        />
        <CountDownModal
          open={countDownModalOpen}
          onCancel={() => setCountDownModalOpen(false)}
          onConfirm={() => setCountDownModalOpen(false)}
        />
      </div>

      <GlobalCom />
    </>
  );
}
