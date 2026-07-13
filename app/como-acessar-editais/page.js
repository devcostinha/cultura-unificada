"use client";

import styles from "./page.module.css";

const PASSOS = [
  {
    num: "01",
    titulo: "Encontre o edital certo pra você",
    desc: "Na aba Editais do app, filtre por categoria (música, teatro, visual, etc.) e prazo. Leia o objeto do edital: ele diz exatamente quem pode participar e o que será financiado.",
    dica: "Dica: priorize editais da sua área de atuação e do seu município — as chances são maiores.",
  },
  {
    num: "02",
    titulo: "Leia o edital inteiro antes de qualquer coisa",
    desc: "Parece óbvio, mas muita gente perde a inscrição por não ler o edital do começo ao fim. Fique atento a: quem pode participar, documentos exigidos, formato do projeto, teto de verba e prazo.",
    dica: "Dica: anote os requisitos obrigatórios numa lista e vá marcando um por um.",
  },
  {
    num: "03",
    titulo: "Monte sua documentação",
    desc: "A maioria dos editais pede: RG/CPF ou CNPJ, comprovante de residência, currículo artístico, portfólio (fotos, vídeos, áudio), carta de apresentação e memorial descritivo do projeto.",
    dica: "Dica: crie uma pasta no celular ou computador com todos esses documentos já digitalizados e prontos.",
  },
  {
    num: "04",
    titulo: "Escreva seu projeto",
    desc: "Um bom projeto cultural tem: título e resumo, objetivos claros, descrição das atividades, público-alvo, justificativa (por que isso importa?), cronograma e orçamento detalhado.",
    dica: "Dica: seja específico. 'Realizar 10 oficinas de percussão no bairro do Itaquera para 150 jovens' é muito melhor do que 'fazer oficinas de música'.",
  },
  {
    num: "05",
    titulo: "Envie dentro do prazo",
    desc: "Editais não aceitam inscrições atrasadas. Configure um lembrete no celular 3 dias antes do prazo para revisar tudo. Envie com antecedência — problemas de sistema acontecem.",
    dica: "Dica: na aba Editais do app você recebe notificações quando o prazo está chegando.",
  },
  {
    num: "06",
    titulo: "Acompanhe o resultado",
    desc: "Após a inscrição, o edital normalmente publica: lista de inscritos, resultado preliminar, prazo para recurso e resultado final. Acompanhe o site da instituição e fique de olho no e-mail.",
    dica: "Dica: não foi dessa vez? Peça feedback quando possível e tente no próximo ciclo. Persistência é parte do jogo.",
  },
];

const LINKS = [
  { nome: "Mapa das Artes (SP)", url: "https://www.prefeitura.sp.gov.br/cidade/secretarias/cultura/", desc: "Secretaria Municipal de Cultura de SP" },
  { nome: "ProAC Digital", url: "https://proac.sp.gov.br/", desc: "Programa de Ação Cultural do Estado de SP" },
  { nome: "Lei Paulo Gustavo", url: "https://www.gov.br/cultura/pt-br", desc: "Ministério da Cultura — editais federais" },
  { nome: "Cultura Viva", url: "https://www.gov.br/cultura/pt-br/assuntos/cultura-viva", desc: "Pontos e pontões de cultura" },
  { nome: "BNDES Cultura", url: "https://www.bndes.gov.br/wps/portal/site/home/onde-atuamos/cultura", desc: "Financiamento cultural do BNDES" },
];

const PERGUNTAS = [
  { p: "Preciso ter CNPJ para me inscrever?", r: "Depende do edital. Muitos aceitam pessoas físicas (CPF). Outros exigem MEI, associação ou OSCIP. Sempre verifique no edital." },
  { p: "Posso me inscrever em mais de um edital ao mesmo tempo?", r: "Na maioria dos casos sim, mas cada edital tem suas regras. Alguns proíbem receber recursos de editais concorrentes para o mesmo projeto." },
  { p: "Fui selecionado. E agora?", r: "Você vai receber orientações para assinar contrato, abrir conta específica (em alguns casos) e apresentar relatórios periódicos das atividades e gastos." },
  { p: "Não sei escrever projeto. O que faço?", r: "Busque apoio em organizações culturais da região, secretarias de cultura do município, ou peça ajuda na aba Sugestões do app — a comunidade pode indicar alguém." },
];

export default function ComoAcessarEditaisPage() {
  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>Guia Prático</div>
        <h1 className="heading">Como Acessar Editais</h1>
        <p className={styles.heroSub}>
          Edital não é bicho de sete cabeças. Com as informações certas, qualquer artista da Zona Leste pode se inscrever e ser selecionado. Segue o passo a passo.
        </p>
      </div>

      {/* Passos */}
      <section className={styles.secao}>
        <h2 className={styles.secaoTitulo}>Passo a passo</h2>
        <div className={styles.passos}>
          {PASSOS.map((p) => (
            <div key={p.num} className={styles.passo}>
              <div className={styles.passoNum}>{p.num}</div>
              <div className={styles.passoConteudo}>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
                <div className={styles.dica}>
                  <span className={styles.dicaIcon}>💡</span>
                  <span>{p.dica}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Links úteis */}
      <section className={styles.secao}>
        <h2 className={styles.secaoTitulo}>Onde encontrar editais</h2>
        <div className={styles.linksGrid}>
          {LINKS.map((l) => (
            <a key={l.nome} href={l.url} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
              <span className={styles.linkNome}>{l.nome}</span>
              <span className={styles.linkDesc}>{l.desc}</span>
              <span className={styles.linkSeta}>→</span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.secao}>
        <h2 className={styles.secaoTitulo}>Perguntas frequentes</h2>
        <div className={styles.faq}>
          {PERGUNTAS.map((fq) => (
            <div key={fq.p} className={styles.faqItem}>
              <h4 className={styles.faqPergunta}>{fq.p}</h4>
              <p className={styles.faqResposta}>{fq.r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className={styles.cta}>
        <p>Viu algum edital aberto? Publica na aba Editais do app para avisar toda a comunidade.</p>
        <a href="/editais" className="btn btn-primary">Ver Editais Abertos</a>
      </div>
    </div>
  );
}
