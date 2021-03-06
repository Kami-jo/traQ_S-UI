<template>
  <div :class="$style.container">
    <div :class="$style.selector">
      <desktop-navigation-selector
        @navigation-change="onNavigationChange"
        @ephemeral-navigation-change="onEphemeralNavigationChange"
        @ephemeral-entry-remove="onEphemeralEntryRemove"
        @ephemeral-entry-add="onEphemeralEntryAdd"
        :current-navigation="navigationSelectorState.currentNavigation"
        :current-ephemeral-navigation="
          ephemeralNavigationSelectorState.currentNavigation
        "
      />
      <desktop-tool-box />
    </div>
    <portal-target :name="targetPortalName" />
    <div :class="$style.navigations">
      <navigation-content
        :class="$style.navigation"
        :current-navigation="navigationSelectorState.currentNavigation"
      />
      <transition name="fade-bottom">
        <ephemeral-navigation-content
          :class="$style.ephemeralNavigation"
          v-if="ephemeralNavigationSelectorState.currentNavigation"
          :current-ephemeral-navigation="
            ephemeralNavigationSelectorState.currentNavigation
          "
        />
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
import EphemeralNavigationContent from '@/components/Main/Navigation/EphemeralNavigationContent/EphemeralNavigationContent.vue'
import useNavigation from './use/navigation'
import DesktopNavigationSelector from '@/components/Main/Navigation/DesktopNavigationSelector.vue'
import DesktopToolBox, {
  targetPortalName
} from '@/components/Main/Navigation/DesktopToolBox.vue'

export default defineComponent({
  name: 'DesktopNavigation',
  components: {
    NavigationContent,
    EphemeralNavigationContent,
    DesktopNavigationSelector,
    DesktopToolBox
  },
  setup() {
    const {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd
    } = useNavigation()

    return {
      navigationSelectorState,
      ephemeralNavigationSelectorState,
      onNavigationChange,
      onEphemeralNavigationChange,
      onEphemeralEntryRemove,
      onEphemeralEntryAdd,
      targetPortalName
    }
  }
})
</script>

<style lang="scss" module>
$ephemeralNavigationSideMargin: 8px;
$ephemeralNavigationMinHeight: 64px;

.container {
  @include color-ui-primary;
  @include background-secondary;
  display: flex;
  width: 100%;
  height: 100%;
}
.selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  overflow: {
    x: hidden;
    y: auto;
  }
}
.navigations {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.navigation {
  width: 100%;
}
.ephemeralNavigation {
  width: #{calc(100% - #{$ephemeralNavigationSideMargin * 2})};
  margin: 0 $ephemeralNavigationSideMargin;
  flex: 0 1 $ephemeralNavigationMinHeight;
}
</style>
