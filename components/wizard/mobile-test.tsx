/**
 * Mobile Responsiveness Test Component
 * This component demonstrates and tests mobile-responsive features
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useResponsive,
  useMobileKeyboard,
  useTouchGestures,
} from "@/hooks/use-mobile-responsive";
import {
  mobileClasses,
  isMobile,
  isTouchDevice,
} from "@/lib/utils/mobile-utils";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  Tablet,
  Monitor,
  Hand,
  Keyboard,
  MousePointer,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function MobileResponsivenessTest() {
  const [testInput, setTestInput] = useState("");
  const [testTextarea, setTestTextarea] = useState("");

  // Test responsive hooks
  const {
    isMobile: hookIsMobile,
    isTablet,
    isDesktop,
    isTouchDevice: hookIsTouchDevice,
    breakpoint,
    viewportWidth,
    viewportHeight,
    isKeyboardOpen,
    orientation,
    getColumns,
  } = useResponsive({ trackKeyboard: true, trackOrientation: true });

  const { keyboardHeight } = useMobileKeyboard();
  const { touchState, handlers } = useTouchGestures();

  // Test utility functions
  const utilIsMobile = isMobile();
  const utilIsTouchDevice = isTouchDevice();

  return (
    <div
      className={cn(
        "p-4 space-y-6 max-w-4xl mx-auto",
        hookIsMobile && "px-2 space-y-4"
      )}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Responsiveness Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Detection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={cn(hookIsMobile ? "p-3" : "p-4")}>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4" />
                <span className="font-medium">Mobile</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {hookIsMobile ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    Hook: {hookIsMobile ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {utilIsMobile ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    Util: {utilIsMobile ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className={cn(hookIsMobile ? "p-3" : "p-4")}>
              <div className="flex items-center gap-2 mb-2">
                <Tablet className="w-4 h-4" />
                <span className="font-medium">Tablet</span>
              </div>
              <div className="flex items-center gap-2">
                {isTablet ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">{isTablet ? "Yes" : "No"}</span>
              </div>
            </Card>

            <Card className={cn(hookIsMobile ? "p-3" : "p-4")}>
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4" />
                <span className="font-medium">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                {isDesktop ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">{isDesktop ? "Yes" : "No"}</span>
              </div>
            </Card>
          </div>

          {/* Viewport Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Viewport Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "grid gap-4",
                  hookIsMobile ? "grid-cols-2" : "grid-cols-4"
                )}
              >
                <div>
                  <span className="text-sm font-medium">Breakpoint</span>
                  <Badge variant="outline" className="ml-2">
                    {breakpoint}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Width</span>
                  <Badge variant="outline" className="ml-2">
                    {viewportWidth}px
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Height</span>
                  <Badge variant="outline" className="ml-2">
                    {viewportHeight}px
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Orientation</span>
                  <Badge variant="outline" className="ml-2">
                    {orientation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Touch and Keyboard Detection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hand className="w-4 h-4" />
                  Touch Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {hookIsTouchDevice ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Hook: {hookIsTouchDevice ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {utilIsTouchDevice ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Util: {utilIsTouchDevice ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  Virtual Keyboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isKeyboardOpen ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Open: {isKeyboardOpen ? "Yes" : "No"}
                    </span>
                  </div>
                  {keyboardHeight > 0 && (
                    <div>
                      <span className="text-sm">Height: </span>
                      <Badge variant="outline">{keyboardHeight}px</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Touch Gesture Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Touch Gesture Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50"
                onTouchStart={handlers.onTouchStart as any}
                onTouchMove={handlers.onTouchMove as any}
                onTouchEnd={handlers.onTouchEnd as any}
              >
                <p className="text-sm text-gray-600 mb-4">
                  Touch and drag in this area to test gesture detection
                </p>
                <div className="space-y-2 text-xs">
                  <div>Pressed: {touchState.isPressed ? "Yes" : "No"}</div>
                  <div>
                    Start: ({touchState.startX}, {touchState.startY})
                  </div>
                  <div>
                    Current: ({touchState.currentX}, {touchState.currentY})
                  </div>
                  <div>
                    Delta: ({touchState.deltaX}, {touchState.deltaY})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Form Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile Form Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Input</label>
                <Input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Type here to test mobile input"
                  className={cn(hookIsMobile && mobileClasses.mobileInput)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Test Textarea</label>
                <Textarea
                  value={testTextarea}
                  onChange={(e) => setTestTextarea(e.target.value)}
                  placeholder="Type here to test mobile textarea"
                  className={cn(hookIsMobile && "text-base resize-none")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsive Grid Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Responsive Grid Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "grid gap-4",
                  hookIsMobile
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="p-4 text-center">
                    <div className="text-lg font-bold">Item {item}</div>
                    <div className="text-sm text-gray-600">
                      Columns: {getColumns(1, 2, 3)}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Button Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile Button Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex gap-2",
                  hookIsMobile ? "flex-col" : "flex-row"
                )}
              >
                <Button
                  variant="default"
                  className={cn(
                    hookIsMobile &&
                      `${mobileClasses.touchButton} w-full min-h-[48px]`
                  )}
                >
                  Primary Button
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    hookIsMobile &&
                      `${mobileClasses.touchButton} w-full min-h-[48px]`
                  )}
                >
                  Secondary Button
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    hookIsMobile &&
                      `${mobileClasses.touchButton} w-full min-h-[48px]`
                  )}
                >
                  Ghost Button
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CSS Classes Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile CSS Classes Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="mobile-only">
                  <Badge variant="secondary">Mobile Only</Badge>
                  <span className="ml-2">This text only shows on mobile</span>
                </div>
                <div className="desktop-only">
                  <Badge variant="secondary">Desktop Only</Badge>
                  <span className="ml-2">This text only shows on desktop</span>
                </div>
                <div className={mobileClasses.mobileContainer}>
                  <Badge variant="outline">Mobile Container</Badge>
                  <span className="ml-2">Using mobile container class</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
