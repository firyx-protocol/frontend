import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import './glass.css'

export interface GlassProps extends BoxProps {
  /** Corner radius for the glass effect (default: 24px) */
  cornerRadius?: string | number
  /** Base blur strength (default: 19px) */
  baseStrength?: string | number
  /** Extra blur amount (default: 0px) */
  extraBlur?: string | number
  /** Softness of the glass effect (default: 32px) */
  softness?: string | number
  /** Tint amount (default: 0) */
  tintAmount?: number
  /** Tint saturation (default: 0) */
  tintSaturation?: number
  /** Tint hue in degrees (default: 0deg) */
  tintHue?: string
  /** Contrast adjustment (default: 1) */
  contrast?: number
  /** Brightness adjustment (default: 0.91) */
  brightness?: number
  /** Invert percentage (default: 10%) */
  invert?: string
  /** Whether to enable pointer events on the glass container (default: false) */
  enablePointerEvents?: boolean
  /** Children components to wrap with glass effect */
  children: React.ReactNode
}

const Glass: React.FC<GlassProps> = ({
  cornerRadius = '24px',
  baseStrength = '19px',
  extraBlur = '0px',
  softness = '32px',
  tintAmount = 0,
  tintSaturation = 0,
  tintHue = '0deg',
  contrast = 1,
  brightness = 0.91,
  invert = '0',
  enablePointerEvents = false,
  children,
  ...boxProps
}) => {
  const cssVariables = {
    '--corner-radius': typeof cornerRadius === 'number' ? `${cornerRadius}px` : cornerRadius,
    '--base-strength': typeof baseStrength === 'number' ? `${baseStrength}px` : baseStrength,
    '--extra-blur': typeof extraBlur === 'number' ? `${extraBlur}px` : extraBlur,
    '--softness': typeof softness === 'number' ? `${softness}px` : softness,
    '--tint-amount': tintAmount,
    '--tint-saturation': tintSaturation,
    '--tint-hue': tintHue,
    '--contrast': contrast,
    '--brightness': brightness,
    '--invert': invert,
  } as React.CSSProperties

  return (
    <Box
      className="GlassContainer"
      style={{
        ...cssVariables,
        pointerEvents: enablePointerEvents ? 'auto' : 'none',
      }}
      {...boxProps}
    >
      {/* Glass Material Layer */}
            {/* Content Layer */}
      <Box className="GlassContent">
        {children}
      </Box>
      <Box className="GlassMaterial">
        {/* Edge Reflection */}
        <Box className="GlassEdgeReflection" />
        
        {/* Emboss Reflection */}
        <Box className="GlassEmbossReflection" />
        
        {/* Refraction */}
        <Box className="GlassRefraction" />
        
        {/* Main Blur */}
        <Box className="GlassBlur" />
        
        {/* Blend Layers */}
        <Box className="BlendLayers" />
        
        {/* Blend Edge */}
        <Box className="BlendEdge" />
        
        {/* Highlight */}
        <Box className="Highlight" />
        
        {/* Brightness */}
        <Box className="Brightness" />
      </Box>
    </Box>
  )
}

export default Glass
