# 🎨 HeroUI v3 Guide

> **Última Atualização:** 2026-01-23\
> **Versão:** 3.0.0-beta.4\
> **Packages:** `@heroui/react`, `@heroui/styles`

Guia de referência para uso correto do HeroUI v3 no KyrieOS.

---

## ⚠️ IMPORTANTE: HeroUI v3 vs v2

O KyrieOS usa **HeroUI v3** que tem uma API completamente diferente da v2.

| Aspecto | v2 (Legacy)      | v3 (Atual)                 |
| ------- | ---------------- | -------------------------- |
| Pattern | Flat Props       | **Compound Components**    |
| Modal   | `<ModalContent>` | `<Modal.Container>`        |
| Card    | `<CardHeader>`   | `<Card.Header>`            |
| Avatar  | `src={url}`      | `<Avatar.Image src={url}>` |

> [!CAUTION]
> **NÃO use exemplos de HeroUI v2!** Sempre consulte o MCP `heroui` ou
> `heroui-react` antes de implementar.

---

## 🔧 Consultar Documentação via MCP

Antes de usar qualquer componente, consulte o MCP:

```
// Listar componentes disponíveis
mcp_heroui_list_components()

// Ver info de um componente
mcp_heroui_get_component_info(component: "Avatar")

// Ver exemplos de uso
mcp_heroui_get_component_examples(component: "Avatar")

// Ver documentação completa
mcp_heroui-react_get_component_docs(components: ["Avatar", "Card"])
```

---

## 📦 Componentes Principais

### Avatar (Compound Pattern)

```tsx
// ❌ ERRADO (v2 style)
<Avatar src={url} name="John" size="sm" />

// ✅ CORRETO (v3 style)
<Avatar size="sm">
  {avatarUrl && (
    <Avatar.Image src={avatarUrl} alt="John Doe" />
  )}
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar>
```

### Card (Compound Pattern)

```tsx
// ❌ ERRADO
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>

// ✅ CORRETO
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Subtitle</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
</Card>
```

### Modal (Compound Pattern)

```tsx
<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
    <Modal.Backdrop />
    <Modal.Container className="fixed inset-0 z-50 flex items-center justify-center">
        <Modal.Dialog className="sm:max-w-md w-full bg-background rounded-xl p-6">
            <Modal.Header>
                <h2>Title</h2>
            </Modal.Header>
            <Modal.Body>
                Content
            </Modal.Body>
            <Modal.Footer>
                <Button onPress={() => setIsOpen(false)}>Close</Button>
            </Modal.Footer>
        </Modal.Dialog>
    </Modal.Container>
</Modal>;
```

### Button

```tsx
// Variantes disponíveis
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Estados
<Button isPending={loading}>Loading...</Button>
<Button isDisabled>Disabled</Button>

// IMPORTANTE: Use onPress, NÃO onClick
<Button onPress={() => doSomething()}>Click</Button>
```

### Input com Label

```tsx
// v3 não tem label prop built-in, use composição
<div className="space-y-2">
    <Label>Email</Label>
    <Input
        name="email"
        placeholder="seu@email.com"
        className="max-w-md"
    />
</div>;
```

### Select (ComboBox/ListBox)

```tsx
// Para selections simples, use ListBox
<ListBox
    selectionMode="single"
    selectedKeys={[selectedValue]}
    onSelectionChange={(keys) => {
        const key = Array.from(keys)[0] as string;
        setSelectedValue(key);
    }}
>
    <ListBox.Item key="option1">Option 1</ListBox.Item>
    <ListBox.Item key="option2">Option 2</ListBox.Item>
</ListBox>;
```

---

## 🎨 Estilização

### CSS Variables (Tailwind)

```css
/* Cores semânticas */
.bg-content1    /* Background principal */
.bg-content2    /* Background secundário */
.text-foreground /* Texto principal */
.text-default-500 /* Texto muted */

/* Cores de status */
.text-primary   /* Azul/Accent */
.text-success   /* Verde */
.text-warning   /* Amarelo */
.text-danger    /* Vermelho */
```

### Glassmorphism Pattern

```tsx
<Card className="bg-content1/50 backdrop-blur-md border border-white/5">
    {/* Content */}
</Card>;
```

---

## ⚠️ Gotchas Comuns

| Problema               | Causa                 | Solução                                            |
| ---------------------- | --------------------- | -------------------------------------------------- |
| `onClick` não funciona | HeroUI usa React Aria | Use `onPress` em vez de `onClick`                  |
| `src` prop não existe  | Avatar v3 é compound  | Use `<Avatar.Image src={...}>`                     |
| Modal não aparece      | Falta Container       | Adicione `<Modal.Container>`                       |
| Estilos não aplicam    | Falta import CSS      | Adicione `@import "@heroui/styles"` no globals.css |

---

## 📋 Checklist de Migração v2 → v3

- [ ] Substituir `<CardHeader>` por `<Card.Header>`
- [ ] Substituir `<ModalContent>` por `<Modal.Container><Modal.Dialog>`
- [ ] Substituir `onClick` por `onPress`
- [ ] Substituir `<Avatar src={...}>` por compound pattern
- [ ] Verificar imports: `@heroui/react` (não `@nextui-org/react`)
