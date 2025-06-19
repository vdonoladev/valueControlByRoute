// Lista de todos os bancos/categorias
const BANCOS = ["2G", "LECCA", "ITAÚ", "GRAFENO", "PIX", "LECCA - MG"];

// Dados dos pedidos, organizados por nome do banco/categoria
let dadosBancos = {}; // Alterado de dadosRotas para dadosBancos

// Inicializa a aplicação ao carregar a página
document.addEventListener("DOMContentLoaded", inicializar);

/**
 * Inicializa os dados dos bancos e carrega pedidos do localStorage.
 */
function inicializar() {
  // Inicializar dados para cada banco se não existirem no localStorage
  BANCOS.forEach((banco) => {
    if (!dadosBancos[banco]) {
      dadosBancos[banco] = [];
    }
  });

  // Carregar pedidos do localStorage
  const savedOrders = localStorage.getItem("dadosBancos");
  if (savedOrders) {
    dadosBancos = JSON.parse(savedOrders);
  }

  // Atualizar a UI para refletir os pedidos carregados para cada banco
  BANCOS.forEach((banco) => {
    const safeBancoId = banco.replace(/[^a-zA-Z0-9]/g, ""); // Para IDs HTML
    atualizarBancoUI(banco, `pedidos-${safeBancoId}`, `total-${safeBancoId}`);
  });

  atualizarTotaisGerais();
}

/**
 * Formata o valor de um input para o padrão de moeda brasileira (R$).
 * @param {HTMLInputElement} input - O elemento input a ser formatado.
 */
function formatarMoeda(input) {
  let valor = input.value;
  valor = valor.replace(/\D/g, ""); // Remove tudo que não é dígito

  if (valor === "") {
    input.value = "";
    return;
  }

  valor = parseInt(valor);
  valor = (valor / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  input.value = valor;
}

/**
 * Converte uma string formatada como moeda brasileira para um número float.
 * @param {string} valorFormatado - A string do valor formatado (ex: "1.234,56").
 * @returns {number} O valor numérico.
 */
function converterParaNumero(valorFormatado) {
  if (!valorFormatado) return 0;
  return parseFloat(valorFormatado.replace(/\./g, "").replace(",", "."));
}

/**
 * Adiciona um novo pedido a um banco específico.
 * @param {string} bancoNome - O nome do banco/categoria.
 * @param {string} pedidoInputId - ID do campo de input do número do pedido.
 * @param {string} valorInputId - ID do campo de input do valor.
 */
function adicionarPedido(bancoNome, pedidoInputId, valorInputId) {
  const pedidoInput = document.getElementById(pedidoInputId);
  const valorInput = document.getElementById(valorInputId);

  const numeroPedido = pedidoInput.value.trim();
  const valor = converterParaNumero(valorInput.value);

  if (!numeroPedido) {
    alert("⚠️ Por favor, informe o número do pedido!");
    pedidoInput.focus();
    return;
  }
  if (!valor || valor <= 0) {
    alert("⚠️ Por favor, informe um valor monetário válido e maior que zero!");
    valorInput.focus();
    return;
  }

  if (!dadosBancos[bancoNome]) {
    dadosBancos[bancoNome] = [];
  }
  if (dadosBancos[bancoNome].some((p) => p.numero === numeroPedido)) {
    alert(
      `⚠️ Este número de pedido (${numeroPedido}) já foi adicionado para o banco "${bancoNome}"!`
    );
    return;
  }

  dadosBancos[bancoNome].push({
    numero: numeroPedido,
    valor: valor,
  });
  localStorage.setItem("dadosBancos", JSON.stringify(dadosBancos)); // Salvar dados atualizados

  pedidoInput.value = "";
  valorInput.value = "";
  pedidoInput.focus();

  const safeBancoId = bancoNome.replace(/[^a-zA-Z0-9]/g, "");
  atualizarBancoUI(bancoNome, `pedidos-${safeBancoId}`, `total-${safeBancoId}`);
  atualizarTotaisGerais();
}

/**
 * Remove um pedido de um banco específico.
 * @param {string} bancoNome - O nome do banco/categoria.
 * @param {number} pedidoIndex - O índice do pedido a ser removido.
 */
function removerPedido(bancoNome, pedidoIndex) {
  if (confirm("Tem certeza que deseja remover este pedido?")) {
    if (!dadosBancos[bancoNome]) {
      console.error("Banco não encontrado para remover pedido:", bancoNome);
      return;
    }
    dadosBancos[bancoNome].splice(pedidoIndex, 1);
    localStorage.setItem("dadosBancos", JSON.stringify(dadosBancos)); // Salvar dados atualizados

    const safeBancoId = bancoNome.replace(/[^a-zA-Z0-9]/g, "");
    atualizarBancoUI(
      bancoNome,
      `pedidos-${safeBancoId}`,
      `total-${safeBancoId}`
    );
    atualizarTotaisGerais();
  }
}

/**
 * Atualiza a exibição dos pedidos e o total de um banco específico na UI.
 * @param {string} bancoNome - O nome do banco/categoria.
 * @param {string} pedidosListId - ID do container dos pedidos na UI.
 * @param {string} totalElementId - ID do elemento que mostra o total do banco.
 */
function atualizarBancoUI(bancoNome, pedidosListId, totalElementId) {
  const pedidosContainer = document.getElementById(pedidosListId);
  const totalElement = document.getElementById(totalElementId);

  if (!pedidosContainer || !totalElement) {
    console.warn(
      `Elementos UI não encontrados para banco: ${bancoNome}, ids: ${pedidosListId}, ${totalElementId}`
    );
    return;
  }

  pedidosContainer.innerHTML = ""; // Limpar pedidos existentes

  const pedidosDoBanco = dadosBancos[bancoNome] || [];

  pedidosDoBanco.forEach((pedido, pedidoIndex) => {
    const pedidoDiv = document.createElement("div");
    pedidoDiv.className = "pedido-item";
    const removerBtnHtml = `<button class="remove-pedido" onclick="removerPedido('${bancoNome}', ${pedidoIndex})" title="Remover pedido">×</button>`;
    pedidoDiv.innerHTML = `
                  <span class="pedido-numero">📋 ${pedido.numero}</span>
                  <span class="pedido-valor">R$ ${pedido.valor.toLocaleString(
                    "pt-BR",
                    { minimumFractionDigits: 2 }
                  )}</span>
                  ${removerBtnHtml}
              `;
    pedidosContainer.appendChild(pedidoDiv);
  });

  const total = pedidosDoBanco.reduce((sum, pedido) => sum + pedido.valor, 0);
  totalElement.textContent = `TOTAL ${bancoNome.toUpperCase()}: R$ ${total.toLocaleString(
    "pt-BR",
    { minimumFractionDigits: 2 }
  )}`;
}

/**
 * Atualiza o total geral de todos os bancos/categorias na interface.
 */
function atualizarTotaisGerais() {
  let totalGeral = 0;
  BANCOS.forEach((banco) => {
    totalGeral += dadosBancos[banco]
      ? dadosBancos[banco].reduce((sum, pedido) => sum + pedido.valor, 0)
      : 0;
  });

  document.getElementById(
    "total-final"
  ).textContent = `TOTAL GERAL: R$ ${totalGeral.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

/**
 * Gera e exibe o resumo completo dos valores em um modal.
 */
function gerarResumo() {
  const modal = document.getElementById("modal-resumo");
  const conteudo = document.getElementById("conteudo-resumo");

  let html = `
              <div class="resumo-header">
                  <div class="resumo-title">📊 RESUMO COMPLETO DE VALORES</div>
                  <div class="resumo-subtitle">Controle de Pagamentos por Banco - De Paulo Pães</div>
              </div>

              <div class="logo-print">
                  <h2>🌾 DE PAULO PÃES</h2>
                  <p>Controle de Valores por Banco</p>
              </div>
          `;

  let hasPedidos = false;
  BANCOS.forEach((banco) => {
    const pedidosDoBanco = dadosBancos[banco] || [];
    const totalDoBanco = pedidosDoBanco.reduce(
      (sum, pedido) => sum + pedido.valor,
      0
    );

    // Adiciona a seção do banco apenas se houver pedidos para ele
    if (pedidosDoBanco.length > 0) {
      hasPedidos = true;
      const safeBancoId = banco.replace(/[^a-zA-Z0-9]/g, "");
      html += `
                    <div class="resumo-secao banco-${safeBancoId.toLowerCase()}">
                        <h3>🏦 ${banco.toUpperCase()}</h3>
                        <div class="rota-resumo-item">
                            <div class="rota-resumo-nome">Pedidos do ${banco}</div>
                            <div class="pedidos-resumo">
                `;
      pedidosDoBanco.forEach((pedido) => {
        html += `
                                <div class="pedido-resumo-item">
                                    <span class="pedido-resumo-numero">📋 Pedido: ${
                                      pedido.numero
                                    }</span>
                                    <span class="pedido-resumo-valor">R$ ${pedido.valor.toLocaleString(
                                      "pt-BR",
                                      { minimumFractionDigits: 2 }
                                    )}</span>
                                </div>
                    `;
      });
      html += `
                            </div>
                            <div class="total-rota">
                                TOTAL ${banco.toUpperCase()}: R$ ${totalDoBanco.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 }
      )}
                            </div>
                        </div>
                    </div>
                `;
    }
  });

  const totalGeralFinal = BANCOS.reduce(
    (sum, banco) =>
      sum +
      (dadosBancos[banco]
        ? dadosBancos[banco].reduce((s, p) => s + p.valor, 0)
        : 0),
    0
  );

  if (hasPedidos) {
    html += `
                <div class="total-geral-resumo">
                    <h3>💰 TOTAL GERAL</h3>
                    <div class="total-geral-valor">R$ ${totalGeralFinal.toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 }
                    )}</div>
                </div>
            `;
  } else {
    html = `
                <div class="resumo-header">
                    <div class="resumo-title">📊 RESUMO COMPLETO</div>
                    <div class="resumo-subtitle">Nenhum pedido cadastrado ainda</div>
                </div>
                <div style="text-align: center; padding: 50px; color: #666; font-size: 1.2em;">
                    <p>🚫 Não há pedidos cadastrados para gerar o resumo.</p>
                    <p>Adicione alguns pedidos nos bancos para visualizar o resumo completo.</p>
                </div>
            `;
  }

  html += `<button class="btn-print-resumo" onclick="window.print()">🖨️ Imprimir Resumo</button>`;

  conteudo.innerHTML = html;
  modal.style.display = "block";
}

/**
 * Fecha o modal de resumo.
 */
function fecharResumo() {
  document.getElementById("modal-resumo").style.display = "none";
}

/**
 * Exporta os dados atuais para um arquivo CSV.
 */
function exportarCSV() {
  let csv = "Banco,Numero_Pedido,Valor\n";

  let hasData = false;
  BANCOS.forEach((banco) => {
    const pedidosDoBanco = dadosBancos[banco] || [];
    pedidosDoBanco.forEach((pedido) => {
      csv += `"${banco}","${pedido.numero}","${pedido.valor
        .toFixed(2)
        .replace(".", ",")}"\n`;
      hasData = true;
    });
  });

  if (!hasData) {
    alert("⚠️ Não há dados para exportar. Adicione alguns pedidos primeiro!");
    return;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `controle_bancos_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("✅ Dados exportados com sucesso para CSV!");
}

/**
 * Limpa todos os dados dos bancos e atualiza a interface.
 */
function limparTudo() {
  if (
    confirm(
      "⚠️ Tem certeza que deseja limpar todos os dados?\n\nEsta ação não pode ser desfeita e removerá todos os pedidos de todos os bancos!"
    )
  ) {
    BANCOS.forEach((banco) => {
      dadosBancos[banco] = [];
    });
    localStorage.removeItem("dadosBancos");

    BANCOS.forEach((banco) => {
      const safeBancoId = banco.replace(/[^a-zA-Z0-9]/g, "");
      atualizarBancoUI(banco, `pedidos-${safeBancoId}`, `total-${safeBancoId}`);
    });

    atualizarTotaisGerais();

    alert("✅ Todos os dados foram limpos com sucesso!");
  }
}

// Fechar modal ao clicar fora
window.onclick = function (event) {
  const modal = document.getElementById("modal-resumo");
  if (event.target === modal) {
    fecharResumo();
  }
};
