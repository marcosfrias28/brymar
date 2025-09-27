"use client";

import React, { useState } from "react";
import { PropertyType, PropertyCharacteristic } from "@/types/wizard";
import { useCharacteristics } from "@/hooks/use-characteristics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  X,
  Home,
  Wrench,
  MapPin,
  Lightbulb,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CharacteristicsSelectorProps {
  propertyType?: PropertyType;
  initialCharacteristics?: PropertyCharacteristic[];
  translations?: Record<string, string>;
  locale?: string;
  onChange?: (characteristics: PropertyCharacteristic[]) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  showRecommendations?: boolean;
  maxSelections?: number;
  minSelections?: number;
}

const CATEGORY_ICONS = {
  amenity: Home,
  feature: Wrench,
  location: MapPin,
};

const CATEGORY_COLORS = {
  amenity: "bg-blue-100 text-blue-800 border-blue-200",
  feature: "bg-green-100 text-green-800 border-green-200",
  location: "bg-purple-100 text-purple-800 border-purple-200",
};

export function CharacteristicsSelector({
  propertyType,
  initialCharacteristics = [],
  translations = {},
  locale = "en",
  onChange,
  onValidationChange,
  className,
  showRecommendations = true,
  maxSelections = 20,
  minSelections = 1,
}: CharacteristicsSelectorProps) {
  const [customCharacteristic, setCustomCharacteristic] = useState("");
  const [customCategory, setCustomCategory] = useState<
    "amenity" | "feature" | "location"
  >("feature");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const {
    characteristics,
    characteristicsByCategory,
    selectedCharacteristics,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    filteredCharacteristics,
    toggleCharacteristic,
    addCustomCharacteristic,
    removeCustomCharacteristic,
    clearAllSelections,
    selectRecommendedForPropertyType,
    validateForPropertyType,
    counts,
    selectedCount,
    totalCount,
    service,
  } = useCharacteristics({
    propertyType,
    initialCharacteristics,
    translations,
    locale,
  });

  // Notify parent of changes
  React.useEffect(() => {
    const allCharacteristics = service.exportCharacteristics();
    onChange?.(allCharacteristics);

    // Validate selection count
    const isValid =
      selectedCount >= minSelections && selectedCount <= maxSelections;
    onValidationChange?.(isValid);
  }, [
    selectedCharacteristics,
    onChange,
    onValidationChange,
    selectedCount,
    minSelections,
    maxSelections,
  ]);

  // Validate characteristics for property type
  const validation = propertyType
    ? validateForPropertyType(propertyType)
    : null;

  const handleAddCustomCharacteristic = () => {
    if (customCharacteristic.trim()) {
      addCustomCharacteristic(customCharacteristic.trim(), customCategory);
      setCustomCharacteristic("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustomCharacteristic = (id: string) => {
    removeCustomCharacteristic(id);
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap = {
      amenity: translations.amenities || "Amenities",
      feature: translations.features || "Features",
      location: translations.location || "Location",
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const renderCharacteristicItem = (char: PropertyCharacteristic) => {
    const Icon = CATEGORY_ICONS[char.category];
    const isCustom = char.id.startsWith("custom_");
    const isInvalid =
      validation?.invalid?.some((invalid) => invalid.id === char.id) || false;

    return (
      <div
        key={char.id}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg border transition-all",
          char.selected
            ? "bg-primary/5 border-primary/20"
            : "bg-background border-border hover:border-border/60",
          isInvalid && "border-destructive/50 bg-destructive/5"
        )}
      >
        <Checkbox
          id={char.id}
          checked={char.selected}
          onCheckedChange={() => toggleCharacteristic(char.id)}
          disabled={!char.selected && selectedCount >= maxSelections}
        />

        <div className="flex-1 flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Label
            htmlFor={char.id}
            className={cn(
              "cursor-pointer flex-1",
              isInvalid && "text-destructive"
            )}
          >
            {char.name}
          </Label>

          <Badge
            variant="outline"
            className={cn("text-xs", CATEGORY_COLORS[char.category])}
          >
            {getCategoryDisplayName(char.category)}
          </Badge>

          {isCustom && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveCustomCharacteristic(char.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {translations.characteristicsTitle || "Property Characteristics"}
          <Badge variant="secondary" className="ml-auto">
            {selectedCount}/{maxSelections}
          </Badge>
        </CardTitle>

        {validation?.invalid && validation.invalid.length > 0 && (
          <div className="text-sm text-destructive">
            {translations.invalidCharacteristics ||
              "Some characteristics are not suitable for this property type"}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selected Characteristics Summary */}
        {selectedCharacteristics.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {translations.selectedCharacteristics ||
                "Selected Characteristics"}
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedCharacteristics.map((char) => (
                <Badge
                  key={char.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => toggleCharacteristic(char.id)}
                >
                  {char.name} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {showRecommendations && propertyType && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectRecommendedForPropertyType}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {translations.selectRecommended || "Select Recommended"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllSelections}
            disabled={selectedCount === 0}
          >
            {translations.clearAll || "Clear All"}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                translations.searchCharacteristics ||
                "Search characteristics..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) =>
                setCategoryFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {translations.allCategories || "All Categories"}
                </SelectItem>
                <SelectItem value="amenity">
                  {getCategoryDisplayName("amenity")} ({counts.amenity || 0})
                </SelectItem>
                <SelectItem value="feature">
                  {getCategoryDisplayName("feature")} ({counts.feature || 0})
                </SelectItem>
                <SelectItem value="location">
                  {getCategoryDisplayName("location")} ({counts.location || 0})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Characteristics Display */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              {translations.allCharacteristics || "All"} (
              {filteredCharacteristics.length})
            </TabsTrigger>
            <TabsTrigger value="by-category">
              {translations.byCategory || "By Category"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredCharacteristics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || categoryFilter
                  ? translations.noCharacteristicsFound ||
                    "No characteristics found"
                  : translations.noCharacteristicsAvailable ||
                    "No characteristics available"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCharacteristics.map(renderCharacteristicItem)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-category" className="space-y-4 mt-4">
            {Object.entries(characteristicsByCategory).map(
              ([category, chars]) => {
                if (chars.length === 0) return null;

                const Icon =
                  CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];

                return (
                  <div key={category}>
                    <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {getCategoryDisplayName(category)} ({chars.length})
                    </Label>
                    <div className="space-y-2 pl-6">
                      {chars.map(renderCharacteristicItem)}
                    </div>
                  </div>
                );
              }
            )}
          </TabsContent>
        </Tabs>

        {/* Add Custom Characteristic */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-2 block">
            {translations.customCharacteristics || "Custom Characteristics"}
          </Label>

          {!showCustomInput ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomInput(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {translations.addCustom || "Add Custom Characteristic"}
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                value={customCharacteristic}
                onChange={(e) => setCustomCharacteristic(e.target.value)}
                placeholder={
                  translations.customCharacteristicPlaceholder ||
                  "Enter characteristic name..."
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomCharacteristic();
                  }
                }}
              />

              <Select
                value={customCategory}
                onValueChange={(value: any) => setCustomCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amenity">
                    {getCategoryDisplayName("amenity")}
                  </SelectItem>
                  <SelectItem value="feature">
                    {getCategoryDisplayName("feature")}
                  </SelectItem>
                  <SelectItem value="location">
                    {getCategoryDisplayName("location")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomCharacteristic}
                  disabled={
                    !customCharacteristic.trim() ||
                    selectedCount >= maxSelections
                  }
                  className="flex-1"
                >
                  {translations.add || "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCharacteristic("");
                  }}
                >
                  {translations.cancel || "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Validation Messages */}
        {selectedCount < minSelections && (
          <div className="text-sm text-destructive">
            {translations.minCharacteristicsRequired?.replace(
              "{min}",
              minSelections.toString()
            ) ||
              `Please select at least ${minSelections} characteristic${
                minSelections > 1 ? "s" : ""
              }`}
          </div>
        )}

        {selectedCount >= maxSelections && (
          <div className="text-sm text-muted-foreground">
            {translations.maxCharacteristicsReached?.replace(
              "{max}",
              maxSelections.toString()
            ) || `Maximum ${maxSelections} characteristics selected`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
