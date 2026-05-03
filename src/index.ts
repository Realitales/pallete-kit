// utilities
export { cn } from './lib/cn'

// Button
export { Button, buttonVariants, type ButtonProps } from './components/Button'

// Batch 1 — pure Tailwind primitives
export {
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants,
  type AlertProps,
} from './components/Alert'
export { Badge, badgeVariants, type BadgeProps } from './components/Badge'
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/Breadcrumb'
export {
  ButtonGroup,
  ButtonGroupSeparator,
  buttonGroupVariants,
  type ButtonGroupProps,
} from './components/ButtonGroup'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './components/Card'
export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  type EmptyMediaProps,
} from './components/Empty'
export {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
  fieldVariants,
  type FieldProps,
} from './components/Field'
export { Input, type InputProps } from './components/Input'
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  inputGroupAddonVariants,
  inputGroupButtonVariants,
  type InputGroupAddonProps,
  type InputGroupButtonProps,
} from './components/InputGroup'
export {
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
  type ItemProps,
  type ItemMediaProps,
} from './components/Item'
export { Kbd, KbdGroup } from './components/Kbd'
export { NativeSelect, type NativeSelectProps } from './components/NativeSelect'
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './components/Pagination'
export { Skeleton } from './components/Skeleton'
export { Spinner } from './components/Spinner'
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/Table'
export { Textarea, type TextareaProps } from './components/Textarea'

// Batch 2 — Radix form primitives
export { Label } from './components/Label'
export { Checkbox } from './components/Checkbox'
export { RadioGroup, RadioGroupItem } from './components/RadioGroup'
export { Switch } from './components/Switch'
export { Slider } from './components/Slider'
export { Toggle, toggleVariants, type ToggleProps } from './components/Toggle'
export {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
} from './components/ToggleGroup'
export { Progress } from './components/Progress'
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/Select'

// Batch 3 — Radix overlay primitives
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/Dialog'
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './components/AlertDialog'
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
  type SheetContentProps,
} from './components/Sheet'
export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
} from './components/Popover'
export { HoverCard, HoverCardTrigger, HoverCardContent } from './components/HoverCard'
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './components/Tooltip'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from './components/DropdownMenu'
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuRadioGroup,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from './components/ContextMenu'
export {
  Menubar,
  MenubarMenu,
  MenubarGroup,
  MenubarPortal,
  MenubarSub,
  MenubarRadioGroup,
  MenubarTrigger,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
} from './components/Menubar'

// Batch 4 — Radix disclosure + layout primitives
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/Accordion'
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/Collapsible'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs'
export { AspectRatio } from './components/AspectRatio'
export { ScrollArea, ScrollBar } from './components/ScrollArea'
export { Separator } from './components/Separator'
export { Avatar, AvatarImage, AvatarFallback } from './components/Avatar'
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuViewport,
  NavigationMenuLink,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
} from './components/NavigationMenu'
export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  sidebarMenuButtonVariants,
  useSidebar,
  type SidebarMenuButtonProps,
} from './components/Sidebar'
export { useIsMobile } from './lib/useIsMobile'

// Batch 5 — third-party-backed
export { Toaster, toast } from './components/Sonner'
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from './components/Command'
export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './components/Drawer'
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from './components/InputOTP'
export {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
} from './components/Combobox'

// Batch 6 — heavy compositions
export { Calendar, type CalendarProps } from './components/Calendar'
export { DatePicker, type DatePickerProps } from './components/DatePicker'
export { DataTable, type DataTableProps } from './components/DataTable'
