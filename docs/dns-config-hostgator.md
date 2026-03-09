# Configuracao DNS - cpfblindado.com no Hostgator

favicon <
Domain: cpfblindado.com

---

Domínio configurado no Netlify!

- DNS Zone ID: 69af0cd35475fd78de8c22c9
- Status: ready

- Netlify Site: limpa-nome-expresso-site

---

## Instrucoes para Hostgator

### Opcao 1: Alterar NS (mais simples)

1. Acesse em **Gerenciamento de Dominios** → **Domínios**
2. Localize **Zona DNS** → **Editar Zona DNS**
3. Se o arquivo de zona existir, clique nele para editá-lo
4. Adicione os 4 NS records abaixo:

| Tipo | Nome | Valor |
|------|------|-------|
| NS | @ | dns1.p02.nsone.net |
| NS | @ | dns2.p02.nsone.net |
| NS | @ | dns3.p02.nsone.net |
| NS | @ | dns4.p02.nsone.net |

5. Salvar

### Opcao 2: Registrar na Hostgator (alternativa)
1. Acesse em **Registrar Domínio**
2. Vá para **Verificar DNS** → **Configurar DNS**
3. Se o dominio nao estiver listado, clique em **Adicionar Domínio**
4. Adicione os mesmos 4 NS records acima
5. Salvar

---

**Apos configurar:**
- Aguarde alguns minutos para propaga DNS
- Netlify detectará automaticamente e configurará SSL
- O site estará disponivel em: `https://cpfblindado.com`

---

## Servidores DNS Netlify
| Servidor | IP |
|---------|-----|
| dns1.p02.nsone.net | - |
| dns2.p02.nsone.net | - |
| dns3.p02.nsone.net | - |
| dns4.p02.nsone.net | - |

## Links Úteis
- Dashboard Hostgator: https://painel.hostgator.com.br/
- Dashboard Netlify: https://app.netlify.com/sites/limpa-nome-expresso-site/settings/domain-management
- Verificar propagacao DNS: https://whatsmydns.net/

---
**Arquivo criado:** `docs/dns-config-hostgator.md`
