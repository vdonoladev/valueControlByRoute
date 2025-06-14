const rotas = [
  "Zona Sul (Mercado)",
  "Pix",
  "Zona Sul",
  "Metropolitana",
  "Serrana",
  "Zona Oeste",
  "Médio Paraíba",
  "Norte Fluminense",
  "Região dos Lagos",
  "Baixada",
  "Minas Gerais",
  "Costa Verde",
  "Centro Sul",
];

let dadosRotas = {};

function inicializar() {
  const container = document.getElementById("rotas-container");

  rotas.forEach((rota, index) => {
    dadosRotas[rota] = [];

    const rotaDiv = document.createElement("div");
    rotaDiv.className = "rota-item";
    rotaDiv.innerHTML = `
                    <div class="rota-nome">${rota}</div>
                    <div class="valores-container">
                        <div class="valores-list" id="valores-${index}"></div>
                        <input type="text" class="valor-input" placeholder="0,00" 
                               onkeypress="if(event.key==='Enter') adicionarValor('${rota}', ${index}, this)"
                               oninput="formatarMoeda(this)">
                        <button class="btn-add-valor" onclick="adicionarValor('${rota}', ${index}, this.previousElementSibling)">+</button>
                        <div class="total-rota" id="total-${index}">R$ 0,00</div>
                    </div>
                `;

    container.appendChild(rotaDiv);
  });
}

function formatarMoeda(input) {
  let valor = input.value;

  // Remove tudo que não é número
  valor = valor.replace(/\D/g, "");

  // Se vazio, não faz nada
  if (valor === "") {
    input.value = "";
    return;
  }

  // Converte para número e adiciona zeros se necessário
  valor = parseInt(valor);

  // Formata como moeda brasileira
  valor = (valor / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  input.value = valor;
}

function converterParaNumero(valorFormatado) {
  // Remove pontos e substitui vírgula por ponto
  return parseFloat(valorFormatado.replace(/\./g, "").replace(",", "."));
}

function adicionarValor(rota, index, input) {
  const valorFormatado = input.value;
  const valor = converterParaNumero(valorFormatado);

  if (valor && valor > 0) {
    dadosRotas[rota].push(valor);
    input.value = "";
    atualizarRota(rota, index);
    atualizarTotal();
  }
}

function removerValor(rota, index, valorIndex) {
  dadosRotas[rota].splice(valorIndex, 1);
  atualizarRota(rota, index);
  atualizarTotal();
}

function atualizarRota(rota, index) {
  const valoresContainer = document.getElementById(`valores-${index}`);
  const totalElement = document.getElementById(`total-${index}`);

  // Limpar valores existentes
  valoresContainer.innerHTML = "";

  // Adicionar valores como tags
  dadosRotas[rota].forEach((valor, valorIndex) => {
    const valorTag = document.createElement("div");
    valorTag.className = "valor-tag";
    valorTag.innerHTML = `
                    R$ ${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}
                    <button class="remove-valor" onclick="removerValor('${rota}', ${index}, ${valorIndex})">×</button>
                `;
    valoresContainer.appendChild(valorTag);
  });

  // Atualizar total da rota
  const total = dadosRotas[rota].reduce((sum, valor) => sum + valor, 0);
  totalElement.textContent = `R$ ${total.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function atualizarTotal() {
  const totalGeral = Object.values(dadosRotas)
    .flat()
    .reduce((sum, valor) => sum + valor, 0);

  document.getElementById(
    "total-final"
  ).textContent = `TOTAL GERAL: R$ ${totalGeral.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function gerarResumo() {
  const totalGeral = Object.values(dadosRotas)
    .flat()
    .reduce((sum, valor) => sum + valor, 0);
  const rotasComValores = rotas.filter((rota) => dadosRotas[rota].length > 0);
  const totalValores = Object.values(dadosRotas).flat().length;

  if (totalValores === 0) {
    alert(
      "⚠️ Não há dados para gerar o resumo!\n\nAdicione alguns valores primeiro."
    );
    return;
  }

  // Calcular estatísticas
  const rotaComMaiorValor = calcularRotaComMaiorValor();
  const mediaGeral = totalGeral / totalValores;
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let resumoHTML = `
                <div class="resumo-header">
                    <h2 class="resumo-title">📊 Relatório Detalhado de Rotas</h2>
                    <p class="resumo-subtitle">Gerado em: ${dataAtual}</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">R$ ${totalGeral.toLocaleString(
    "pt-BR",
    { minimumFractionDigits: 2 }
  )}</div>
                        <div class="stat-label">Total Geral</div>
                    </div>
                    <div class="stat-card green">
                        <div class="stat-value">${rotasComValores.length}</div>
                        <div class="stat-label">Rotas Ativas</div>
                    </div>
                    <div class="stat-card orange">
                        <div class="stat-value">${totalValores}</div>
                        <div class="stat-label">Total de Valores</div>
                    </div>
                    <div class="stat-card purple">
                        <div class="stat-value">R$ ${mediaGeral.toLocaleString(
    "pt-BR",
    { minimumFractionDigits: 2 }
  )}</div>
                        <div class="stat-label">Média por Valor</div>
                    </div>
                </div>

                <div class="rotas-resumo">
                    <h3>📋 Detalhamento por Rota</h3>
            `;

  // Ordenar rotas por total (maior para menor)
  const rotasOrdenadas = rotasComValores.sort((a, b) => {
    const totalA = dadosRotas[a].reduce((sum, valor) => sum + valor, 0);
    const totalB = dadosRotas[b].reduce((sum, valor) => sum + valor, 0);
    return totalB - totalA;
  });

  rotasOrdenadas.forEach((rota, index) => {
    const valores = dadosRotas[rota];
    const totalRota = valores.reduce((sum, valor) => sum + valor, 0);
    const mediaRota = totalRota / valores.length;
    const percentualDoTotal = (totalRota / totalGeral) * 100;

    const isDestaque = rota === rotaComMaiorValor;
    const classeDestaque = isDestaque ? "destaque" : "";

    resumoHTML += `
                    <div class="rota-resumo-item ${classeDestaque}">
                        <div class="rota-resumo-info">
                            <div class="rota-resumo-nome">
                                ${isDestaque ? "🏆 " : ""}${rota}
                                ${isDestaque ? " (Maior Total)" : ""}
                            </div>
                            <div class="rota-resumo-detalhes">
                                ${valores.length} valor${valores.length > 1 ? "es" : ""
      } • 
                                Média: R$ ${mediaRota.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })} • 
                                ${percentualDoTotal.toFixed(1)}% do total
                            </div>
                        </div>
                        <div class="rota-resumo-total">
                            R$ ${totalRota.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}
                        </div>
                    </div>
                `;
  });

  resumoHTML += `
                </div>

                <div class="total-geral-resumo">
                    <h3>💰 VALOR TOTAL CONSOLIDADO</h3>
                    <div class="total-geral-valor">R$ ${totalGeral.toLocaleString(
    "pt-BR",
    { minimumFractionDigits: 2 }
  )}</div>
                </div>
            `;

  document.getElementById("conteudo-resumo").innerHTML = resumoHTML;
  document.getElementById("modal-resumo").style.display = "block";
}

function calcularRotaComMaiorValor() {
  let maiorTotal = 0;
  let rotaComMaiorTotal = "";

  rotas.forEach((rota) => {
    const totalRota = dadosRotas[rota].reduce((sum, valor) => sum + valor, 0);
    if (totalRota > maiorTotal) {
      maiorTotal = totalRota;
      rotaComMaiorTotal = rota;
    }
  });

  return rotaComMaiorTotal;
}

function fecharResumo() {
  document.getElementById("modal-resumo").style.display = "none";
}

// Fechar modal clicando fora dele
window.onclick = function (event) {
  const modal = document.getElementById("modal-resumo");
  if (event.target === modal) {
    fecharResumo();
  }
};

function exportarCSV() {
  // Cabeçalho do CSV
  let csv = "Rota;Valor Individual;Total da Rota\n";

  let totalGeral = 0;
  let linhasDetalhadas = [];
  let resumoRotas = [];

  rotas.forEach((rota) => {
    const valores = dadosRotas[rota];
    const totalRota = valores.reduce((sum, valor) => sum + valor, 0);
    totalGeral += totalRota;

    if (valores.length > 0) {
      // Adiciona cada valor individual
      valores.forEach((valor, index) => {
        const valorFormatado = valor.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        const totalRotaFormatado = totalRota.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        // Só mostra o total da rota na primeira linha de cada rota
        const totalParaExibir = index === 0 ? totalRotaFormatado : "";

        linhasDetalhadas.push(`${rota};${valorFormatado};${totalParaExibir}`);
      });

      // Resumo das rotas
      const totalRotaFormatado = totalRota.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      resumoRotas.push(
        `${rota};${valores.length} valores;${totalRotaFormatado}`
      );
    }
  });

  // Monta o CSV final
  csv += linhasDetalhadas.join("\n");
  csv += "\n\n--- RESUMO POR ROTA ---\n";
  csv += "Rota;Quantidade de Valores;Total da Rota\n";
  csv += resumoRotas.join("\n");

  // Total geral
  const totalGeralFormatado = totalGeral.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  csv += `\n\n--- TOTAL GERAL ---\n`;
  csv += `TOTAL;${totalGeralFormatado};\n`;

  // Data atual
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  csv += `\nExportado em: ${dataAtual}`;

  // Download do arquivo
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `valores_por_rota_${dataAtual.replace(/\//g, "-")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function limparTudo() {
  if (
    confirm(
      "⚠️ ATENÇÃO: Isso irá apagar TODOS os valores de TODAS as rotas!\n\nTem certeza que deseja continuar?"
    )
  ) {
    rotas.forEach((rota, index) => {
      dadosRotas[rota] = [];
      atualizarRota(rota, index);
    });
    atualizarTotal();
    alert("✅ Todos os valores foram removidos!");
  }
}

// Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", inicializar);
