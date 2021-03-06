import store from '@/store'
import { MainViewComponentState } from '@/store/ui/mainView/state'

/**
 * モバイル用にナビゲーションの開閉を行う
 */
const useNavigation = () => {
  const openNav = () => {
    if (
      !store.getters.ui.isMobile ||
      !store.getters.ui.mainView.isNoComponentOpen
    ) {
      return
    }
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.NavAppearingAuto
    )
  }
  const closeNav = () => {
    if (!store.getters.ui.isMobile || !store.getters.ui.mainView.isNavOpen) {
      return
    }
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.NavDisappearingAuto
    )
  }
  return { openNav, closeNav }
}

export default useNavigation
