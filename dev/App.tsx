import { useEffect, useMemo, useState } from 'react'
import { Builder } from './builder/Builder'
import { SiteHeader } from './app/chrome/SiteHeader'
import { FooterNote } from './app/chrome/FooterNote'
import { DocsHero } from './app/chrome/DocsHero'
import { motion } from 'framer-motion'
import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  CloudIcon,
  CopyIcon,
  CreditCardIcon,
  KeyboardIcon,
  LogOutIcon,
  MailIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DataTable,
  DatePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  Kbd,
  KbdGroup,
  Label,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  NativeSelect,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from '@lib'

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY — drives both sidebar nav and the main content sections

type Entry = {
  id: string
  name: string
  description: string
  render: () => React.ReactNode
}

type Group = { label: string; entries: Entry[] }

// Each renderer is defined below; we wire them up in the registry constant.

// ─────────────────────────────────────────────────────────────────────────────
// APP

type Page = 'components' | 'foundations' | 'builder'

export function App() {
  const [page, setPage] = useState<Page>('components')
  const [activeId, setActiveId] = useState<string>('button')

  // Track which section is in view
  useEffect(() => {
    const selector =
      page === 'components' ? '[data-component]' : '[data-foundation]'
    const sections = document.querySelectorAll<HTMLElement>(selector)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [page])

  // When switching pages, scroll to top + reset active id
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setActiveId(page === 'components' ? 'button' : 'overview')
  }, [page])

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader page={page} onPageChange={setPage} />
      {page === 'builder' ? (
        <Builder />
      ) : (
        <div className="mx-auto flex max-w-screen-2xl">
          <SidebarNav page={page} activeId={activeId} />
          <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
            {page === 'components' ? <ComponentsPage /> : <FoundationsPage />}
            <FooterNote />
          </main>
        </div>
      )}
    </div>
  )
}

export function ComponentsPage() {
  let counter = 0
  return (
    <>
      <DocsHero />
      {REGISTRY.map((group, gi) => (
        <section key={group.label} className="mt-16">
          <div className="mb-8 flex items-baseline gap-4">
            <span className="font-mono text-muted-fg text-xs tabular">
              {String(gi + 1).padStart(2, '0')}
            </span>
            <h2 className="font-display text-fg text-2xl font-semibold tracking-tight">
              {group.label}
              <span className="acid-period">.</span>
            </h2>
            <div className="bg-border ml-2 h-px flex-1" />
            <span className="tag text-muted-fg tabular">
              {group.entries.length} {group.entries.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="space-y-14">
            {group.entries.map((entry) => {
              counter += 1
              return (
                <ComponentEntry
                  key={entry.id}
                  entry={entry}
                  num={String(counter).padStart(2, '0')}
                />
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR

export function SidebarNav({ page, activeId }: { page: Page; activeId: string }) {
  if (page === 'foundations') return <FoundationsSidebar activeId={activeId} />
  // Compute global numbering across all groups
  let counter = 0
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border lg:block">
      <nav className="px-5 py-7">
        <div className="mb-6 flex items-baseline justify-between px-2">
          <p className="font-display text-fg text-base font-semibold">
            Components
          </p>
          <p className="tag text-muted-fg tabular">53</p>
        </div>
        {REGISTRY.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="tag text-muted-fg mb-2 px-2">{group.label}</p>
            <ul className="space-y-px">
              {group.entries.map((e) => {
                counter += 1
                const num = String(counter).padStart(2, '0')
                return (
                  <li key={e.id}>
                    <a
                      href={`#${e.id}`}
                      data-active={activeId === e.id}
                      className="sidebar-accent text-muted-fg hover:text-fg data-[active=true]:text-fg group flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors"
                    >
                      <span className="text-muted-fg/60 group-data-[active=true]:text-acid font-mono text-[10px] tabular w-5 shrink-0">
                        {num}
                      </span>
                      <span className="group-data-[active=true]:font-medium">
                        {e.name}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function FoundationsSidebar({ activeId }: { activeId: string }) {
  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'radius', label: 'Radius' },
    { id: 'shadows', label: 'Shadows' },
    { id: 'icons', label: 'Iconography' },
  ]
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border lg:block">
      <nav className="px-5 py-7">
        <div className="mb-6 flex items-baseline justify-between px-2">
          <p className="font-display text-fg text-base font-semibold">
            Foundations
          </p>
          <p className="tag text-muted-fg">Tokens</p>
        </div>
        <ul className="space-y-px">
          {items.map((i, idx) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                data-active={activeId === i.id}
                className="sidebar-accent text-muted-fg hover:text-fg data-[active=true]:text-fg group flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors"
              >
                <span className="text-muted-fg/60 group-data-[active=true]:text-acid font-mono text-[10px] tabular w-5 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="group-data-[active=true]:font-medium">
                  {i.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT ENTRY — heading + description + preview box

function ComponentEntry({ entry, num }: { entry: Entry; num: string }) {
  return (
    <article id={entry.id} data-component className="scroll-mt-20">
      <div className="flex items-baseline gap-3">
        <span className="tag text-muted-fg tabular">{num}</span>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {entry.name}
        </h3>
      </div>
      <p className="text-muted-fg mt-1 ml-8 text-sm leading-relaxed">
        {entry.description}
      </p>
      <ComponentPreview num={num}>{entry.render()}</ComponentPreview>
    </article>
  )
}

function ComponentPreview({
  children,
  num,
}: {
  children: React.ReactNode
  num: string
}) {
  return (
    <div className="relative mt-4 ml-8 overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid-paper absolute inset-0 opacity-40" />
      <div className="absolute left-3 top-3 flex items-center gap-2 z-10">
        <span className="size-1 rounded-full bg-acid" />
        <span className="tag text-muted-fg tabular">Preview · {num}</span>
      </div>
      <div className="relative flex min-h-[240px] items-center justify-center p-12">
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLES

function Ex_Button() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

function Ex_ButtonGroup() {
  return (
    <ButtonGroup>
      <Button variant="outline">Bold</Button>
      <Button variant="outline">Italic</Button>
      <Button variant="outline">Underline</Button>
    </ButtonGroup>
  )
}

function Ex_Input() {
  return (
    <div className="w-full max-w-sm">
      <Input type="email" placeholder="hello@example.com" />
    </div>
  )
}

function Ex_InputGroup() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="username" />
      </InputGroup>
    </div>
  )
}

function Ex_InputOTP() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

function Ex_Textarea() {
  return (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Type your message here." rows={4} />
    </div>
  )
}

function Ex_Label() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" defaultChecked />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  )
}

function Ex_Field() {
  return (
    <FieldGroup className="w-full max-w-sm">
      <Field>
        <FieldLabel htmlFor="f-email">Email</FieldLabel>
        <Input id="f-email" type="email" placeholder="you@example.com" />
        <FieldDescription>We'll never share your email.</FieldDescription>
      </Field>
    </FieldGroup>
  )
}

function Ex_Checkbox() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="c1" defaultChecked />
        <Label htmlFor="c1">Marketing emails</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c2" />
        <Label htmlFor="c2">Security alerts</Label>
      </div>
    </div>
  )
}

function Ex_RadioGroup() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="r-default" />
        <Label htmlFor="r-default">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="r-comf" />
        <Label htmlFor="r-comf">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="compact" id="r-comp" />
        <Label htmlFor="r-comp">Compact</Label>
      </div>
    </RadioGroup>
  )
}

function Ex_Switch() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane Mode</Label>
    </div>
  )
}

function Ex_Slider() {
  const [v, setV] = useState([33])
  return (
    <div className="w-full max-w-sm">
      <Slider value={v} onValueChange={setV} max={100} />
    </div>
  )
}

function Ex_Toggle() {
  return (
    <Toggle aria-label="Toggle italic">
      <span className="italic">I</span>
    </Toggle>
  )
}

function Ex_ToggleGroup() {
  return (
    <ToggleGroup type="multiple" variant="outline">
      <ToggleGroupItem value="bold">B</ToggleGroupItem>
      <ToggleGroupItem value="italic" className="italic">I</ToggleGroupItem>
      <ToggleGroupItem value="underline" className="underline">U</ToggleGroupItem>
    </ToggleGroup>
  )
}

function Ex_Select() {
  return (
    <Select defaultValue="apple">
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="durian">Durian</SelectItem>
      </SelectContent>
    </Select>
  )
}

function Ex_NativeSelect() {
  return (
    <div className="w-[200px]">
      <NativeSelect defaultValue="next">
        <option value="next">Next.js</option>
        <option value="vite">Vite</option>
        <option value="remix">Remix</option>
        <option value="astro">Astro</option>
      </NativeSelect>
    </div>
  )
}

function Ex_Combobox() {
  const opts = [
    { value: 'next', label: 'Next.js' },
    { value: 'svelte', label: 'SvelteKit' },
    { value: 'nuxt', label: 'Nuxt' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' },
  ]
  return <Combobox options={opts} placeholder="Pick a framework…" />
}

function Ex_DatePicker() {
  return <DatePicker placeholder="Pick a date" />
}

function Ex_Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div className="rounded-md border border-border bg-bg p-1">
      <Calendar mode="single" selected={date} onSelect={setDate} />
    </div>
  )
}

function Ex_Alert() {
  return (
    <div className="w-full max-w-md">
      <Alert>
        <BellIcon />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can configure this component to look the way you want.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function Ex_Avatar() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JR</AvatarFallback>
      </Avatar>
    </div>
  )
}

function Ex_Badge() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}

function Ex_Card() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-fg text-sm">
        Push notifications and email alerts can be configured here.
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <CheckIcon /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  )
}

function Ex_Kbd() {
  return (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>shift</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}

function Ex_Progress() {
  return (
    <div className="w-full max-w-sm">
      <Progress value={66} />
    </div>
  )
}

function Ex_Separator() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Radix UI</p>
      <p className="text-muted-fg text-sm">Headless components for React.</p>
      <Separator />
      <div className="flex h-5 items-center gap-3 text-sm">
        <span>Blog</span>
        <Separator orientation="vertical" />
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  )
}

function Ex_Skeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-[180px]" />
        <Skeleton className="h-3 w-[140px]" />
      </div>
    </div>
  )
}

function Ex_Spinner() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Spinner /> Loading…
    </div>
  )
}

function Ex_AspectRatio() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md border border-border bg-muted">
        <div className="grid size-full place-items-center text-muted-fg text-sm">
          16 / 9
        </div>
      </AspectRatio>
    </div>
  )
}

function Ex_Empty() {
  return (
    <Empty className="w-full max-w-md border border-dashed border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailIcon />
        </EmptyMedia>
        <EmptyTitle>No messages</EmptyTitle>
        <EmptyDescription>
          You'll see messages from your team here once you start a conversation.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Compose</Button>
      </EmptyContent>
    </Empty>
  )
}

function Ex_Item() {
  return (
    <div className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia>
          <Avatar>
            <AvatarFallback>JR</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jay Rico</ItemTitle>
          <ItemDescription>jay@example.com · Admin</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <SettingsIcon />
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}

function Ex_Breadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function Ex_NavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4 md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#" className="block">
                    <div className="text-sm font-medium">Introduction</div>
                    <p className="text-muted-fg mt-1 text-xs">
                      Re-usable components built with Radix UI.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a href="#" className="block">
                    <div className="text-sm font-medium">Installation</div>
                    <p className="text-muted-fg mt-1 text-xs">How to install palette.</p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="font-medium px-3 py-2 text-sm">
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function Ex_Menubar() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Toggle Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

function Ex_Pagination() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function Ex_Tabs() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-muted-fg mt-3 text-sm">
        Make changes to your account settings here.
      </TabsContent>
      <TabsContent value="password" className="text-muted-fg mt-3 text-sm">
        Change your password here.
      </TabsContent>
    </Tabs>
  )
}

function Ex_Sidebar() {
  return (
    <div className="text-muted-fg text-sm italic">
      <code className="not-italic">Sidebar</code> is a page-level layout
      component — see <code className="not-italic">SidebarProvider</code> in the
      docs.
    </div>
  )
}

function Ex_AlertDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function Ex_Dialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Jay Rico" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Ex_Drawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move to archive</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to archive this conversation?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Archive</Button>
          <Button variant="outline">Cancel</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function Ex_Sheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

function Ex_Popover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <h4 className="text-sm font-medium">Dimensions</h4>
        <p className="text-muted-fg mt-1 text-xs">
          Set the width and height of the layer.
        </p>
      </PopoverContent>
    </Popover>
  )
}

function Ex_HoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback>NJ</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">@nextjs</p>
            <p className="text-muted-fg mt-1 text-xs">
              The React framework — created and maintained by Vercel.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function Ex_Tooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  )
}

function Ex_DropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Open menu <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCardIcon /> Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SettingsIcon /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <KeyboardIcon /> Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Ex_ContextMenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="border-border text-muted-fg flex h-[120px] w-[280px] items-center justify-center rounded-md border border-dashed text-sm">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Reload</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function Ex_Sonner() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast('Event has been created', {
          description: 'Sunday, December 03, 2023 at 9:00 AM',
          action: { label: 'Undo', onClick: () => undefined },
        })
      }
    >
      Show toast
    </Button>
  )
}

function Ex_Table() {
  const rows = [
    { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
    { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
    { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  ]
  return (
    <div className="w-full max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    r.status === 'Paid'
                      ? 'default'
                      : r.status === 'Pending'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell>{r.method}</TableCell>
              <TableCell className="text-right">{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function Ex_DataTable() {
  type Row = { id: string; email: string; status: string; amount: number }
  const data: Row[] = [
    { id: 'm5gr84i9', email: 'ken99@yahoo.com', status: 'success', amount: 316 },
    { id: '3u1reuv4', email: 'abe45@gmail.com', status: 'success', amount: 242 },
    { id: 'derv1ws0', email: 'monserrat@yahoo.com', status: 'processing', amount: 837 },
    { id: '5kma53ae', email: 'silas22@gmail.com', status: 'success', amount: 874 },
    { id: 'bhqecj4p', email: 'carmella@hotmail.com', status: 'failed', amount: 721 },
  ]
  const columns = useMemo(
    () => [
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'status', header: 'Status' },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }: { row: { getValue: (k: string) => unknown } }) => (
          <div className="text-right font-medium">
            ${(row.getValue('amount') as number).toFixed(2)}
          </div>
        ),
      },
    ],
    [],
  )
  return (
    <div className="w-full max-w-2xl">
      <DataTable columns={columns} data={data} pageSize={3} />
    </div>
  )
}

function Ex_Accordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes — animations powered by tw-animate-css.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function Ex_Collapsible() {
  const [open, setOpen] = useState(true)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">@palette starred 3 repositories</p>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDownIcon />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="text-sm rounded-md border border-border px-3 py-2">@radix-ui/primitives</div>
      <CollapsibleContent className="space-y-2">
        <div className="text-sm rounded-md border border-border px-3 py-2">@vercel/next.js</div>
        <div className="text-sm rounded-md border border-border px-3 py-2">@tailwindlabs/tailwindcss</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function Ex_ScrollArea() {
  const tags = Array.from({ length: 30 }, (_, i) => `Tag ${i + 1}`)
  return (
    <ScrollArea className="h-48 w-48 rounded-md border border-border">
      <div className="p-3">
        <p className="text-sm font-medium">Tags</p>
        {tags.map((t) => (
          <div key={t} className="text-muted-fg py-1.5 text-sm">
            {t}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function Ex_Command() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border">
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <SmileIcon /> Search emoji
            </CommandItem>
            <CommandItem>
              <CloudIcon /> Calculator
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <UserIcon /> Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SettingsIcon /> Settings
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY

const REGISTRY: Group[] = [
  {
    label: 'Form',
    entries: [
      { id: 'button', name: 'Button', description: 'Triggers an action or event.', render: Ex_Button },
      { id: 'button-group', name: 'Button Group', description: 'Group of related buttons.', render: Ex_ButtonGroup },
      { id: 'checkbox', name: 'Checkbox', description: 'Single binary on/off control.', render: Ex_Checkbox },
      { id: 'combobox', name: 'Combobox', description: 'Searchable select powered by cmdk.', render: Ex_Combobox },
      { id: 'date-picker', name: 'Date Picker', description: 'Calendar inside a popover.', render: Ex_DatePicker },
      { id: 'field', name: 'Field', description: 'Wraps label, control and description.', render: Ex_Field },
      { id: 'input', name: 'Input', description: 'Single-line text input.', render: Ex_Input },
      { id: 'input-group', name: 'Input Group', description: 'Input with addons or icons.', render: Ex_InputGroup },
      { id: 'input-otp', name: 'Input OTP', description: 'One-time-passcode input.', render: Ex_InputOTP },
      { id: 'label', name: 'Label', description: 'Renders an accessible label.', render: Ex_Label },
      { id: 'native-select', name: 'Native Select', description: 'Styled native <select>.', render: Ex_NativeSelect },
      { id: 'radio-group', name: 'Radio Group', description: 'Single-choice button group.', render: Ex_RadioGroup },
      { id: 'select', name: 'Select', description: 'Custom select dropdown.', render: Ex_Select },
      { id: 'slider', name: 'Slider', description: 'Range input.', render: Ex_Slider },
      { id: 'switch', name: 'Switch', description: 'On/off toggle.', render: Ex_Switch },
      { id: 'textarea', name: 'Textarea', description: 'Multi-line text input.', render: Ex_Textarea },
      { id: 'toggle', name: 'Toggle', description: 'Pressable on/off button.', render: Ex_Toggle },
      { id: 'toggle-group', name: 'Toggle Group', description: 'Group of pressable toggles.', render: Ex_ToggleGroup },
    ],
  },
  {
    label: 'Display',
    entries: [
      { id: 'alert', name: 'Alert', description: 'Static callout box.', render: Ex_Alert },
      { id: 'aspect-ratio', name: 'Aspect Ratio', description: 'Constrains child to a ratio.', render: Ex_AspectRatio },
      { id: 'avatar', name: 'Avatar', description: 'User image with fallback.', render: Ex_Avatar },
      { id: 'badge', name: 'Badge', description: 'Small status / label pill.', render: Ex_Badge },
      { id: 'calendar', name: 'Calendar', description: 'Date grid (react-day-picker).', render: Ex_Calendar },
      { id: 'card', name: 'Card', description: 'Container with header / content / footer.', render: Ex_Card },
      { id: 'empty', name: 'Empty', description: 'Empty-state placeholder.', render: Ex_Empty },
      { id: 'item', name: 'Item', description: 'Generic list item.', render: Ex_Item },
      { id: 'kbd', name: 'Kbd', description: 'Keyboard key glyph.', render: Ex_Kbd },
      { id: 'progress', name: 'Progress', description: 'Linear progress bar.', render: Ex_Progress },
      { id: 'separator', name: 'Separator', description: 'Visual divider line.', render: Ex_Separator },
      { id: 'skeleton', name: 'Skeleton', description: 'Loading placeholder.', render: Ex_Skeleton },
      { id: 'spinner', name: 'Spinner', description: 'Indeterminate loading.', render: Ex_Spinner },
    ],
  },
  {
    label: 'Navigation',
    entries: [
      { id: 'breadcrumb', name: 'Breadcrumb', description: 'Hierarchical nav trail.', render: Ex_Breadcrumb },
      { id: 'menubar', name: 'Menubar', description: 'App-style top menu bar.', render: Ex_Menubar },
      { id: 'navigation-menu', name: 'Navigation Menu', description: 'Site nav with mega-menu.', render: Ex_NavigationMenu },
      { id: 'pagination', name: 'Pagination', description: 'Page-number controls.', render: Ex_Pagination },
      { id: 'sidebar', name: 'Sidebar', description: 'Composable app sidebar.', render: Ex_Sidebar },
      { id: 'tabs', name: 'Tabs', description: 'Tab panel switcher.', render: Ex_Tabs },
    ],
  },
  {
    label: 'Overlay',
    entries: [
      { id: 'alert-dialog', name: 'Alert Dialog', description: 'Confirmation modal.', render: Ex_AlertDialog },
      { id: 'context-menu', name: 'Context Menu', description: 'Right-click menu.', render: Ex_ContextMenu },
      { id: 'dialog', name: 'Dialog', description: 'Modal window.', render: Ex_Dialog },
      { id: 'drawer', name: 'Drawer', description: 'Bottom-sheet drawer (vaul).', render: Ex_Drawer },
      { id: 'dropdown-menu', name: 'Dropdown Menu', description: 'Click-trigger menu.', render: Ex_DropdownMenu },
      { id: 'hover-card', name: 'Hover Card', description: 'Preview popover on hover.', render: Ex_HoverCard },
      { id: 'popover', name: 'Popover', description: 'Floating panel.', render: Ex_Popover },
      { id: 'sheet', name: 'Sheet', description: 'Edge-anchored dialog.', render: Ex_Sheet },
      { id: 'sonner', name: 'Sonner', description: 'Toast notifications.', render: Ex_Sonner },
      { id: 'tooltip', name: 'Tooltip', description: 'Hover / focus tooltip.', render: Ex_Tooltip },
    ],
  },
  {
    label: 'Disclosure',
    entries: [
      { id: 'accordion', name: 'Accordion', description: 'Vertically collapsing sections.', render: Ex_Accordion },
      { id: 'collapsible', name: 'Collapsible', description: 'Single expand / collapse region.', render: Ex_Collapsible },
      { id: 'scroll-area', name: 'Scroll Area', description: 'Custom-styled scrollbars.', render: Ex_ScrollArea },
    ],
  },
  {
    label: 'Data',
    entries: [
      { id: 'table', name: 'Table', description: 'Styled <table> primitives.', render: Ex_Table },
      { id: 'data-table', name: 'Data Table', description: 'Tanstack-table powered.', render: Ex_DataTable },
    ],
  },
  {
    label: 'Command',
    entries: [
      { id: 'command', name: 'Command', description: 'Command palette / fuzzy menu.', render: Ex_Command },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDATIONS PAGE

export function FoundationsPage() {
  return (
    <>
      <FoundationsOverview />
      <FoundationsColors />
      <FoundationsTypography />
      <FoundationsSpacing />
      <FoundationsRadius />
      <FoundationsShadows />
      <FoundationsIcons />
    </>
  )
}

// Counter outside the function so each FoundationsSection picks up the next number.
let foundationsCounter = 0

function FoundationsSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  const num = useMemo(() => {
    foundationsCounter += 1
    return String(foundationsCounter).padStart(2, '0')
  }, [])
  return (
    <section id={id} data-foundation className="scroll-mt-20 mt-20 first:mt-0">
      <div className="mb-2 flex items-baseline gap-4">
        <span className="font-mono text-muted-fg text-xs tabular">{num}</span>
        <h2 className="font-display text-fg text-3xl font-semibold tracking-tight">
          {title}
          <span className="acid-period">.</span>
        </h2>
      </div>
      {description && (
        <p className="text-muted-fg ml-9 mt-3 max-w-2xl text-sm leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-8 ml-9">{children}</div>
    </section>
  )
}

// ── Overview ───────────────────────────────────────────────────────────

function FoundationsOverview() {
  return (
    <motion.section
      id="overview"
      data-foundation
      className="scroll-mt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="tag text-muted-fg mb-6 flex items-center gap-3">
        <span>Studio</span>
        <span className="bg-border h-px w-6" />
        <span>The system</span>
      </div>
      <h1
        className="font-display text-fg leading-[0.95] tracking-tight"
        style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)' }}
      >
        Foundations<span className="acid-period">.</span>
      </h1>
      <p className="text-muted-fg mt-6 max-w-xl text-base leading-relaxed">
        The tokens, type scale, spacing, and primitives that every component
        inherits. Override any <code className="font-mono text-sm text-fg">--color-*</code>{' '}
        or <code className="font-mono text-sm text-fg">--radius-*</code> at any DOM scope
        to repaint the whole library.
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <StatCard label="Components" value="53" />
        <StatCard label="Token namespace" value="--color-* / --radius-*" />
        <StatCard label="Stack" value="Tailwind v4 · Radix · React 19" />
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/40 px-4 py-2 flex items-center gap-2">
          <span className="size-1 rounded-full bg-acid" />
          <p className="tag text-muted-fg">Install</p>
        </div>
        <div className="space-y-3 p-4">
          <CodeRow code="bun add palette" />
          <CodeRow code={`import { Button } from 'palette'\nimport 'palette/styles.css'`} />
        </div>
      </div>
    </motion.section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-fg/20">
      <p className="tag text-muted-fg">{label}</p>
      <p className="font-display text-fg mt-2 text-base">{value}</p>
    </div>
  )
}

function CodeRow({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard not allowed */
    }
  }
  return (
    <div className="group relative mt-1 first:mt-0">
      <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg leading-relaxed">
        {code}
      </pre>
      <button
        onClick={onCopy}
        aria-label="Copy"
        className="text-muted-fg hover:text-fg absolute right-2 top-2 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      </button>
    </div>
  )
}

// ── Colors ─────────────────────────────────────────────────────────────

const COLOR_GROUPS: { label: string; tokens: { name: string; var: string; light: string }[] }[] = [
  {
    label: 'Surface',
    tokens: [
      { name: 'Background', var: '--color-bg', light: 'oklch(1 0 0)' },
      { name: 'Foreground', var: '--color-fg', light: 'oklch(0.145 0 0)' },
      { name: 'Card', var: '--color-card', light: 'oklch(1 0 0)' },
      { name: 'Card foreground', var: '--color-card-fg', light: 'oklch(0.145 0 0)' },
      { name: 'Muted', var: '--color-muted', light: 'oklch(0.97 0 0)' },
      { name: 'Muted foreground', var: '--color-muted-fg', light: 'oklch(0.556 0 0)' },
    ],
  },
  {
    label: 'Border',
    tokens: [
      { name: 'Border', var: '--color-border', light: 'oklch(0.922 0 0)' },
      { name: 'Input', var: '--color-input', light: 'oklch(0.922 0 0)' },
      { name: 'Ring', var: '--color-ring', light: 'oklch(0.708 0 0)' },
    ],
  },
  {
    label: 'Action',
    tokens: [
      { name: 'Primary', var: '--color-primary', light: 'oklch(0.205 0 0)' },
      { name: 'Primary foreground', var: '--color-primary-fg', light: 'oklch(0.985 0 0)' },
      { name: 'Secondary', var: '--color-secondary', light: 'oklch(0.97 0 0)' },
      { name: 'Secondary foreground', var: '--color-secondary-fg', light: 'oklch(0.205 0 0)' },
      { name: 'Accent', var: '--color-accent', light: 'oklch(0.97 0 0)' },
      { name: 'Accent foreground', var: '--color-accent-fg', light: 'oklch(0.205 0 0)' },
    ],
  },
  {
    label: 'Feedback',
    tokens: [
      { name: 'Destructive', var: '--color-destructive', light: 'oklch(0.577 0.245 27.325)' },
      { name: 'Destructive foreground', var: '--color-destructive-fg', light: 'oklch(0.985 0 0)' },
    ],
  },
]

function FoundationsColors() {
  return (
    <FoundationsSection
      id="colors"
      title="Colors"
      description="Semantic tokens, not raw colors. Override any --color-* CSS variable to repaint the whole library; both light and dark themes are defined."
    >
      <div className="space-y-10">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="text-muted-fg mb-3 text-xs font-medium uppercase tracking-wider">
              {group.label}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.tokens.map((t) => (
                <ColorSwatch key={t.var} name={t.name} cssVar={t.var} oklch={t.light} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </FoundationsSection>
  )
}

function ColorSwatch({
  name,
  cssVar,
  oklch,
}: {
  name: string
  cssVar: string
  oklch: string
}) {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-fg/30 hover:shadow-sm">
      <div
        className="aspect-[5/3] w-full border-b border-border"
        style={{ background: `var(${cssVar})` }}
      />
      <div className="px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display truncate text-sm font-medium">{name}</p>
          <span className="size-1 shrink-0 rounded-full bg-acid opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="text-muted-fg mt-0.5 truncate font-mono text-[10px]">
          {cssVar}
        </p>
        <p className="text-muted-fg/60 truncate font-mono text-[10px]">
          {oklch}
        </p>
      </div>
    </div>
  )
}

// ── Typography ────────────────────────────────────────────────────────

function FoundationsTypography() {
  const sizes = [
    { name: 'text-5xl', value: '3rem', sample: 'Display' },
    { name: 'text-4xl', value: '2.25rem', sample: 'Headline' },
    { name: 'text-3xl', value: '1.875rem', sample: 'Section' },
    { name: 'text-2xl', value: '1.5rem', sample: 'Title' },
    { name: 'text-xl', value: '1.25rem', sample: 'Subtitle' },
    { name: 'text-lg', value: '1.125rem', sample: 'Lead' },
    { name: 'text-base', value: '1rem', sample: 'Body — the brown fox.' },
    { name: 'text-sm', value: '0.875rem', sample: 'Small — secondary text and metadata.' },
    { name: 'text-xs', value: '0.75rem', sample: 'Caption — labels, chips, footnotes.' },
  ]
  return (
    <FoundationsSection
      id="typography"
      title="Typography"
      description="A simple type scale. Components default to the system font stack so consumer brands inherit their own faces — override --font-sans / --font-mono to take over."
    >
      <div className="space-y-5">
        {sizes.map((s) => (
          <div
            key={s.name}
            className="flex items-baseline gap-6 border-b border-border pb-4 last:border-b-0"
          >
            <div className="w-32 shrink-0 space-y-0.5">
              <p className="font-mono text-xs text-fg">{s.name}</p>
              <p className="font-mono text-[10px] text-muted-fg">{s.value}</p>
            </div>
            <p className={`${s.name} leading-tight`}>{s.sample}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-muted-fg mb-3 text-xs font-medium uppercase tracking-wider">
            Sans · --font-sans
          </p>
          <p className="font-sans text-3xl">The quick brown fox.</p>
          <p className="font-sans text-muted-fg mt-2 text-sm">
            Pack my box with five dozen liquor jugs.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-muted-fg mb-3 text-xs font-medium uppercase tracking-wider">
            Mono · --font-mono
          </p>
          <p className="font-mono text-3xl">{'<Button />'}</p>
          <p className="font-mono text-muted-fg mt-2 text-sm">
            const radius = '0.625rem'
          </p>
        </div>
      </div>
    </FoundationsSection>
  )
}

// ── Spacing ───────────────────────────────────────────────────────────

function FoundationsSpacing() {
  const steps = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32]
  return (
    <FoundationsSection
      id="spacing"
      title="Spacing"
      description="Tailwind's spacing scale, in 0.25rem (4px) units. Use these for padding, gap, and margin throughout the library."
    >
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s} className="flex items-center gap-4">
            <p className="font-mono text-muted-fg w-12 text-xs tabular-nums">
              {s}
            </p>
            <p className="font-mono text-muted-fg w-20 text-xs tabular-nums">
              {(s * 0.25).toFixed(2)}rem
            </p>
            <div
              className="h-4 rounded-sm bg-fg"
              style={{ width: `${s * 4}px` }}
            />
          </div>
        ))}
      </div>
    </FoundationsSection>
  )
}

// ── Radius ────────────────────────────────────────────────────────────

function FoundationsRadius() {
  const radii = [
    { name: '--radius-sm', cls: 'rounded-sm' },
    { name: '--radius-md', cls: 'rounded-md' },
    { name: '--radius-lg', cls: 'rounded-lg' },
    { name: '--radius-xl', cls: 'rounded-xl' },
    { name: 'rounded-full', cls: 'rounded-full' },
  ]
  return (
    <FoundationsSection
      id="radius"
      title="Radius"
      description="Corner radius is derived from a single --radius token. Override it to retune sharpness across all components at once."
    >
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {radii.map((r) => (
          <div
            key={r.name}
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5"
          >
            <div className={`size-16 border-2 border-fg ${r.cls}`} />
            <p className="font-mono text-muted-fg text-[11px]">{r.name}</p>
          </div>
        ))}
      </div>
    </FoundationsSection>
  )
}

// ── Shadows ───────────────────────────────────────────────────────────

function FoundationsShadows() {
  const shadows = [
    { name: 'shadow-xs', cls: 'shadow-xs' },
    { name: 'shadow-sm', cls: 'shadow-sm' },
    { name: 'shadow-md', cls: 'shadow-md' },
    { name: 'shadow-lg', cls: 'shadow-lg' },
    { name: 'shadow-xl', cls: 'shadow-xl' },
  ]
  return (
    <FoundationsSection
      id="shadows"
      title="Shadows"
      description="Elevation comes from Tailwind's shadow scale. Used sparingly — primarily for popovers, dropdowns, and dialogs."
    >
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {shadows.map((s) => (
          <div
            key={s.name}
            className="flex flex-col items-center gap-3 rounded-lg bg-muted/30 p-6"
          >
            <div className={`size-16 rounded-md bg-card ${s.cls}`} />
            <p className="font-mono text-muted-fg text-[11px]">{s.name}</p>
          </div>
        ))}
      </div>
    </FoundationsSection>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────

function FoundationsIcons() {
  const icons = [
    { name: 'Bell', node: <BellIcon /> },
    { name: 'Check', node: <CheckIcon /> },
    { name: 'ChevronDown', node: <ChevronDownIcon /> },
    { name: 'Cloud', node: <CloudIcon /> },
    { name: 'Copy', node: <CopyIcon /> },
    { name: 'CreditCard', node: <CreditCardIcon /> },
    { name: 'Keyboard', node: <KeyboardIcon /> },
    { name: 'LogOut', node: <LogOutIcon /> },
    { name: 'Mail', node: <MailIcon /> },
    { name: 'Moon', node: <MoonIcon /> },
    { name: 'Search', node: <SearchIcon /> },
    { name: 'Settings', node: <SettingsIcon /> },
    { name: 'Smile', node: <SmileIcon /> },
    { name: 'Sun', node: <SunIcon /> },
    { name: 'User', node: <UserIcon /> },
  ]
  return (
    <FoundationsSection
      id="icons"
      title="Iconography"
      description="Powered by lucide-react. 1.5px stroke, currentColor — inherits the parent's text color. Sized via Tailwind ('size-4', 'size-5', etc.)."
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {icons.map((i) => (
          <div
            key={i.name}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-fg/20"
          >
            <div className="text-fg [&_svg]:size-5">{i.node}</div>
            <p className="font-mono text-muted-fg text-[10px]">{i.name}</p>
          </div>
        ))}
      </div>
    </FoundationsSection>
  )
}
