/**
 * In order to have a typed theme, we must create a custom styled instance
 * 
 * This will be resolved by https://github.com/emotion-js/emotion/pull/1501 
 * when that is released
 */

import styled, { CreateStyled } from '@emotion/styled'
import * as ThemeUI from 'theme-ui'


export default styled as CreateStyled<ThemeUI.Theme>