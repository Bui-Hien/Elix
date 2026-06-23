'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X, Grid3X3, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductCard } from '@/components/product/product-card'
import { formatPrice } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useProducts } from '@/hooks/use-products'
import { useTags } from '@/hooks/use-tags'
import { categoriesApi } from '@/lib/api/categories'
import type { Category } from '@/types'
import { consultationApi, ConsultationGoal } from '@/lib/api/consultation'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp đến cao' },
  { value: 'price-desc', label: 'Giá: Cao đến thấp' },
]

const PRICE_RANGES = [
  { min: 0, max: 1000000, label: 'Dưới 1 triệu' },
  { min: 1000000, max: 3000000, label: '1 - 3 triệu' },
  { min: 3000000, max: 5000000, label: '3 - 5 triệu' },
  { min: 5000000, max: 10000000, label: '5 - 10 triệu' },
  { min: 10000000, max: Infinity, label: 'Trên 10 triệu' },
]

const ELEMENTS = [
  { value: '', label: 'Tất cả mệnh' },
  { value: 'Kim', label: 'Kim (Kim loại)' },
  { value: 'Moc', label: 'Mộc (Gỗ)' },
  { value: 'Thuy', label: 'Thủy (Nước)' },
  { value: 'Hoa', label: 'Hỏa (Lửa)' },
  { value: 'Tho', label: 'Thổ (Đất)' },
]

export function ProductsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tags } = useTags()
  const [categories, setCategories] = useState<Category[]>([])
  const [purposes, setPurposes] = useState<ConsultationGoal[]>([])
  const [gemstones, setGemstones] = useState<any[]>([])
  console.log('UseTags hook result:', tags);

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('category')?.split(',').filter(Boolean) || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tags')?.split(',').filter(Boolean) || [])
  const [selectedElements, setSelectedElements] = useState<string[]>(searchParams.get('element')?.split(',').filter(Boolean) || [])
  const [selectedGemstone, setSelectedGemstone] = useState<string>(searchParams.get('gemstone') || '')
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(searchParams.get('purposeIds')?.split(',').filter(Boolean) || [])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000000])
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [gridCols, setGridCols] = useState<3 | 4>(4)
  const [page, setPage] = useState(1)

  // Fetch categories and gemstones on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, gemstonesData, purposesData] = await Promise.all([
          categoriesApi.getAll(),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/gemstones?isActive=true`, {
            credentials: 'include'
          }).then(res => res.json()).catch(() => []),
          consultationApi.getGoals().catch(() => [])
        ])
        setCategories((categoriesData as Category[]).filter(cat => cat.isActive))
        setGemstones(gemstonesData)
        setPurposes(purposesData.filter((p: any) => p.isActive))
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  // Sync state with URL params when they change
  useEffect(() => {
    const categoryParam = searchParams.get('category')?.split(',').filter(Boolean) || []
    const tagsParam = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const elementParam = searchParams.get('element')?.split(',').filter(Boolean) || []
    const gemstoneParam = searchParams.get('gemstone') || ''
    const purposesParam = searchParams.get('purposeIds')?.split(',').filter(Boolean) || []
    const qParam = searchParams.get('q') || ''
    const sortParam = searchParams.get('sort') || 'newest'

    // Only update if values actually changed to prevent infinite loops
    if (JSON.stringify(categoryParam) !== JSON.stringify(selectedCategories)) setSelectedCategories(categoryParam)
    if (JSON.stringify(tagsParam) !== JSON.stringify(selectedTags)) setSelectedTags(tagsParam)
    if (JSON.stringify(elementParam) !== JSON.stringify(selectedElements)) setSelectedElements(elementParam)
    if (gemstoneParam !== selectedGemstone) setSelectedGemstone(gemstoneParam)
    if (JSON.stringify(purposesParam) !== JSON.stringify(selectedPurposes)) setSelectedPurposes(purposesParam)
    if (sortParam !== sort) setSort(sortParam)

    if (qParam !== search) {
      setSearch(qParam)
    }
  }, [searchParams])

  // Derive category IDs from selected categories
  const categoryIds = useMemo(() => {
    if (selectedCategories.length === 0) return undefined
    return selectedCategories.map(c => parseInt(c)).filter(id => !isNaN(id))
  }, [selectedCategories])

  // Derive tag IDs from slugs
  const tagIds = useMemo(() => {
    if (selectedTags.length === 0) return undefined
    return selectedTags
      .map(slug => {
        const tag = tags.find(t => (t.slug || t.name.toLowerCase().replace(/ /g, '-')) === slug)
        return tag ? parseInt(tag.id.toString()) : undefined
      })
      .filter((id): id is number => id !== undefined)
  }, [selectedTags, tags])

  const { products: fetchedProducts, pagination, isLoading } = useProducts({
    q: search,
    categoryIds: categoryIds,
    tagIds: tagIds,
    elements: selectedElements.length > 0 ? selectedElements : undefined,
    gemstoneTypeId: selectedGemstone ? parseInt(selectedGemstone) : undefined,
    purposeIds: selectedPurposes.length > 0 ? selectedPurposes.map(Number) : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 15000000 ? priceRange[1] : undefined,
    sort,
    page,
    pageSize: 12
  })

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, selectedCategories, selectedTags, selectedElements, selectedGemstone, priceRange, sort])

  const clearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedTags([])
    setSelectedElements([])
    setSelectedGemstone('')
    setPriceRange([0, 15000000])
    setSort('newest')
    setPage(1)
    router.push('/products')
  }

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedTags.length > 0 || selectedElements.length > 0 || selectedGemstone || priceRange[0] > 0 || priceRange[1] < 15000000

  // ... Keep FilterContent component definitions ... 
  const FilterContent = () => (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}>
      {/* Categories */}
      <div>
        <h3 className="mb-3" style={{ fontWeight: 500, color: '#4E332D' }}>Danh mục</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategories([])}
            className={cn(
              'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
              selectedCategories.length === 0 ? 'bg-brand-lightest' : 'hover:bg-gray-100'
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  selectedCategories.length === 0 ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
            )}>
              {selectedCategories.length === 0 && <span className="text-[10px]">✓</span>}
            </div>
            <span style={{ color: selectedCategories.length === 0 ? '#9C665A' : '#4A5565', fontWeight: selectedCategories.length === 0 ? 500 : 400 }}>Tất cả sản phẩm</span>
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id.toString())
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategories(selectedCategories.filter(id => id !== cat.id.toString()))
                  } else {
                    setSelectedCategories([...selectedCategories, cat.id.toString()])
                  }
                }}
                className={cn(
                  'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
                  isSelected ? 'bg-brand-lightest' : 'hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  isSelected ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
                )}>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
                <span style={{ color: isSelected ? '#9C665A' : '#4A5565', fontWeight: isSelected ? 500 : 400 }}>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Purpose (Mục đích) */}
      <div>
        <h3 className="mb-3" style={{ fontWeight: 500, color: '#4E332D' }}>Mục đích</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedPurposes([])}
            className={cn(
              'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
              selectedPurposes.length === 0 ? 'bg-brand-lightest' : 'hover:bg-gray-100'
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  selectedPurposes.length === 0 ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
            )}>
              {selectedPurposes.length === 0 && <span className="text-[10px]">✓</span>}
            </div>
            <span style={{ color: selectedPurposes.length === 0 ? '#9C665A' : '#4A5565', fontWeight: selectedPurposes.length === 0 ? 500 : 400 }}>Tất cả mục đích</span>
          </button>
          {purposes.map((p) => {
            const isSelected = selectedPurposes.includes(p.id.toString())
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedPurposes(selectedPurposes.filter(id => id !== p.id.toString()))
                  } else {
                    setSelectedPurposes([...selectedPurposes, p.id.toString()])
                  }
                }}
                className={cn(
                  'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
                  isSelected ? 'bg-brand-lightest' : 'hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  isSelected ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
                )}>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
                <span style={{ color: isSelected ? '#9C665A' : '#4A5565', fontWeight: isSelected ? 500 : 400 }}>{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Element (Mệnh) */}
      <div>
        <h3 className="mb-3" style={{ fontWeight: 500, color: '#4E332D' }}>Mệnh phù hợp</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedElements([])}
            className={cn(
              'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
              selectedElements.length === 0 ? 'bg-brand-lightest' : 'hover:bg-gray-100'
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  selectedElements.length === 0 ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
            )}>
              {selectedElements.length === 0 && <span className="text-[10px]">✓</span>}
            </div>
            <span style={{ color: selectedElements.length === 0 ? '#9C665A' : '#4A5565', fontWeight: selectedElements.length === 0 ? 500 : 400 }}>Tất cả mệnh</span>
          </button>
          {ELEMENTS.filter(e => e.value !== '').map((element) => {
            const isSelected = selectedElements.includes(element.value)
            return (
              <button
                key={element.value}
                onClick={() => {
                  if (isSelected) {
                    setSelectedElements(selectedElements.filter(e => e !== element.value))
                  } else {
                    setSelectedElements([...selectedElements, element.value])
                  }
                }}
                className={cn(
                  'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
                  isSelected ? 'bg-brand-lightest' : 'hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  isSelected ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
                )}>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
                <span style={{ color: isSelected ? '#9C665A' : '#4A5565', fontWeight: isSelected ? 500 : 400 }}>{element.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gemstone Types */}
      {gemstones.length > 0 && (
        <div>
          <h3 className="mb-3" style={{ fontWeight: 500, color: '#4E332D' }}>Loại đá</h3>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            <button
              onClick={() => setSelectedGemstone('')}
              className={cn(
                'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
                !selectedGemstone ? 'bg-brand-lightest' : 'hover:bg-gray-100'
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  !selectedGemstone ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
              )}>
                {!selectedGemstone && <span className="text-[10px]">✓</span>}
              </div>
              <span style={{ color: !selectedGemstone ? '#9C665A' : '#4A5565', fontWeight: !selectedGemstone ? 500 : 400 }}>Tất cả loại đá</span>
            </button>
            {gemstones.map((gem: any) => (
              <button
                key={gem.id}
                onClick={() => setSelectedGemstone(gem.id.toString())}
                className={cn(
                  'flex items-center gap-2 w-full text-left text-sm py-2 px-3 rounded-lg transition-colors group',
                  selectedGemstone === gem.id.toString() ? 'bg-brand-lightest' : 'hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  selectedGemstone === gem.id.toString() ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
                )}>
                  {selectedGemstone === gem.id.toString() && <span className="text-[10px]">✓</span>}
                </div>
                <span style={{ color: selectedGemstone === gem.id.toString() ? '#9C665A' : '#4A5565', fontWeight: selectedGemstone === gem.id.toString() ? 500 : 400 }}>{gem.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="mb-3" style={{ fontWeight: 500, color: '#4E332D' }}>Khoảng giá</h3>
        <div className="px-1">
          <Slider
            value={priceRange}
            onValueChange={(value: number[]) => setPriceRange(value as [number, number])}
            min={0}
            max={15000000}
            step={500000}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {PRICE_RANGES.map((range, index) => (
            <button
              key={index}
              onClick={() => setPriceRange([range.min, range.max === Infinity ? 15000000 : range.max])}
              className="block w-full text-left text-sm py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: '#4A5565', fontWeight: 400 }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags - Horizontal Grid Layout */}
      <div>
        <h3 className="mb-3" style={{ fontWeight: 500, color: '#4E332D' }}>Tags</h3>
        <div className="grid grid-cols-2 gap-2">
          {tags.map((tag) => {
            const slug = tag.slug || tag.name.toLowerCase().replace(/ /g, '-')
            const isSelected = selectedTags.includes(slug)
            return (
              <button
                key={tag.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedTags(selectedTags.filter(t => t !== slug))
                  } else {
                    setSelectedTags([...selectedTags, slug])
                  }
                }}
                className={cn(
                  "flex items-center gap-2 text-sm py-2 px-3 rounded-lg border-2 transition-all font-medium group",
                  isSelected
                    ? "bg-brand-lightest border-brand-tint-40 hover:bg-brand-tint-60"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                  isSelected ? "bg-[#F3E5E2] border-[#C37F70] text-[#C37F70]" : "border-[#C37F70] bg-white group-hover:border-[#C37F70]"
                )}>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
                <span className="truncate" style={{ color: isSelected ? '#9C665A' : '#4A5565', fontWeight: isSelected ? 500 : 400 }}>{tag.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full rounded-lg bg-transparent"
          onClick={clearFilters}
        >
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="container mx-auto px-4 py-2">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold" style={{ color: '#4E332D' }}>
            {selectedCategories.length === 1
              ? categories.find(c => c.id.toString() === selectedCategories[0])?.name || 'Sản phẩm'
              : selectedCategories.length > 1
                ? `Đã chọn ${selectedCategories.length} danh mục`
                : 'Tất cả sản phẩm'
            }
          </h1>
          <p className="mt-1 text-gray-500">
            {pagination.totalCount} sản phẩm
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5">
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-2xl border border-gray-100 p-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm hoặc #hashtag..."
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearch(value)

                    // Live hashtag detection: if user types a tag after # and hits space/enter or it matches exactly
                    if (value.startsWith('#') && tags.length > 0) {
                      const tagSlug = value.substring(1).toLowerCase().replace(/ /g, '-')
                      const tag = tags.find(t => (t.slug || t.name.toLowerCase().replace(/ /g, '-')) === tagSlug)
                      if (tag) {
                        if (!selectedTags.includes(tagSlug)) {
                          setSelectedTags([...selectedTags, tagSlug])
                        }
                        setSearch('') // Clear search box after successful tag detection
                      }
                    }
                  }}
                  className="pl-9 h-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2 h-10 rounded-xl bg-transparent">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#4E332D' }}>Bộ lọc</span>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 bg-brand-lightest text-brand-darkest">
                        {selectedCategories.length + selectedElements.length + (selectedGemstone ? 1 : 0) + selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white p-6 flex flex-col h-full">
                  <SheetHeader>
                    <SheetTitle style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#4E332D' }}>Bộ lọc</SheetTitle>
                    <SheetDescription className="hidden sm:block">Sử dụng các bộ lọc bên dưới để tìm sản phẩm</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 flex-1 overflow-y-auto pr-2 -mr-2 pb-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl border-gray-200">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Grid Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={gridCols === 3 ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setGridCols(3)}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridCols === 4 ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setGridCols(4)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedCategories.map((catId) => (
                  <Badge key={`cat-${catId}`} variant="secondary" className="gap-1 bg-violet-100 text-brand-darkest hover:bg-brand-tint-60">
                    {categories.find(c => c.id.toString() === catId)?.name || catId}
                    <div role="button" onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== catId))} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))}
                {selectedElements.map((elementVal) => {
                  const el = ELEMENTS.find(e => e.value === elementVal)
                  return (
                    <Badge key={`el-${elementVal}`} variant="secondary" className="gap-1 bg-brand-lightest text-brand-darkest hover:bg-brand-tint-60">
                      {el?.label}
                      <div role="button" onClick={() => setSelectedElements(selectedElements.filter(e => e !== elementVal))} className="cursor-pointer">
                        <X className="h-3 w-3" />
                      </div>
                    </Badge>
                  )
                })}
                {selectedGemstone && (
                  <Badge variant="secondary" className="gap-1 bg-violet-100 text-brand-darkest hover:bg-brand-tint-60">
                    {gemstones.find(g => g.id.toString() === selectedGemstone)?.name || selectedGemstone}
                    <div role="button" onClick={() => setSelectedGemstone('')} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                )}
                {selectedTags.map((tagSlug) => (
                  <Badge key={tagSlug} variant="secondary" className="gap-1 bg-violet-100 text-brand-darkest hover:bg-brand-tint-60">
                    {tags.find(t => t.slug === tagSlug)?.name || tagSlug}
                    <div role="button" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tagSlug))} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))}
                {selectedPurposes.map((pId) => (
                  <Badge key={`purpose-${pId}`} variant="secondary" className="gap-1 bg-violet-100 text-violet-700 hover:bg-violet-200">
                    {purposes.find(p => p.id.toString() === pId)?.name || pId}
                    <div role="button" onClick={() => setSelectedPurposes(selectedPurposes.filter(id => id !== pId))} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 15000000) && (
                  <Badge variant="secondary" className="gap-1 bg-brand-lightest text-brand-darkest hover:bg-brand-tint-60">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <div role="button" onClick={() => setPriceRange([0, 15000000])} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className={cn(
                'grid gap-4 md:gap-6',
                gridCols === 3
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              )}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-[400px] animate-pulse" />
                ))}
              </div>
            ) : fetchedProducts.length > 0 ? (
              <>
                <div className={cn(
                  'grid gap-4 md:gap-6',
                  gridCols === 3
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                )}>
                  {fetchedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="h-10 w-10 p-0 rounded-lg border-[#D6B9B3]"
                  >
                    {'<'}
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const p = i + 1
                      if (
                        p === 1 ||
                        p === pagination.totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      ) {
                        return (
                          <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            onClick={() => setPage(p)}
                            className={cn(
                              "h-10 w-10 p-0 rounded-lg border-[#D6B9B3]",
                              p === page && "bg-[#DBB2A9] border-[#D6B9B3] text-white hover:bg-[#D0A59C]"
                            )}
                          >
                            {p}
                          </Button>
                        )
                      } else if (
                        p === page - 2 ||
                        p === page + 2
                      ) {
                        return <span key={p} className="mx-1 text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className="h-10 w-10 p-0 rounded-lg border-[#D6B9B3]"
                  >
                    {'>'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="mt-2 text-gray-500">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl bg-transparent"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
