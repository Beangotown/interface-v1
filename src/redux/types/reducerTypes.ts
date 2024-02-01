import { ReactNode } from 'react';
import {
  IAccountInfoSync,
  IBeanPassListItem,
  IGameSetting,
  IPlayerInformation,
  WalletInfoType,
  WalletType,
} from 'types';

export type InfoStateType = {
  isMobile?: boolean;
  theme: string | undefined | null;
  baseInfo: {
    rpcUrl?: string;
    identityPoolID?: string;
    // some config
  };
  walletInfo: WalletInfoType | null;
  walletType: WalletType;
  accountInfoSync: IAccountInfoSync | null;
  loginStatus: LoginStatus;
  playerInfo?: IPlayerInformation;
  showLeaderboard: boolean;
  showLeaderboardInfo: boolean;
  showGameRecord: boolean;
  assetVisible: boolean;
  gameSetting?: IGameSetting;
  isNeedSyncAccountInfo: boolean;
  curBeanPass?: IBeanPassListItem;
};

export type PageLoadingType = {
  open: boolean;
  content?: ReactNode;
};

export type GlobalComponentsInfoStateType = {
  pageLoading: PageLoadingType;
};

export enum LoginStatus {
  UNLOGIN = 1,
  LOGGED = 2,
  LOCK = 3,
}
