import './App.css';
import generatePDF, { Margin } from 'react-to-pdf';
import api from './services/api'
import { BsFiletypePdf } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { GrDocument } from "react-icons/gr";
import { useEffect, useState } from 'react';

function App() {

  const recuperarConteudoParaPDF = () => document.getElementById('conteudo');

  const [pedidos, setPedidos] = useState([])
  const [pedido, setPedido] = useState([])
  const [cliente, setCliente] = useState([])

  const [busca, setBusca] = useState('');
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);



  useEffect(() => {
    Promise.all([BuscaPedidos()])

  }, [])

  const handleBuscaChange = (e) => {
    const valorBusca = e.target.value.toUpperCase();
    setBusca(valorBusca);

    const pedidosFiltrados = valorBusca === ''
      ? pedidos
      : pedidos.filter((item) => {
        const idPedido = item.id.slice(0, 6).toUpperCase();
        return idPedido.startsWith(valorBusca);
      })

    setPedidosFiltrados(pedidosFiltrados);
  };

  async function BuscaPedidos() {

    try {
      const res = await api.get(`/lista/ordemDeCompras`)
      setPedidos(res.data);
      setPedidosFiltrados(res.data);





    } catch (error) {
      console.log(error.response);


    }
  }

  async function BuscaCliente(clienteID) {
    try {
      const res = await api.get(`/busca/cliente?clienteID=${clienteID}`)
      setCliente(res.data)

    } catch (error) {
      console.log(error.response);

    }
  }

  async function BuscaPedido(pedidoID) {

    try {
      const res = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${pedidoID}`)
      setPedido(res.data);
      BuscaCliente(res.data?.cliente?.id)


    } catch (error) {
      console.log(error.response);
    }
  }

  const convertData = (input) => {

    const data = new Date(input)

    const day = String(data.getDate()).padStart(2, '0');
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const year = String(data.getFullYear() % 100).padStart(2, '0'); // ano com 2 dígitos
    return (`${day}/${month}/${year}`);
  };

  const personalizacao = {
    // Baixar/Salvar = save / Abrir no navegador = open
    method: 'save',
    filename: 'OC - ' + pedido?.id?.slice(0, 6).toUpperCase() + ' - Cades Original',
    page: {
      // Definir a margem: SMALL ou MEDIUM 
      margin: Margin.MEDIUM,
      // Formato da página: A4 ou letter
      format: 'A4',
      // Orientação do arquivo: portrait ou landscape
      orientation: 'portrait',

    },
  }

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>


      <div style={{
        display: 'flex',
        flexDirection: "column",
        padding: 10,
        marginRight: 20,
        borderColor: '#eee',
        borderRight: '1px solid #eee',
      }}>

        <input
          type="text"
          value={busca}
          onChange={handleBuscaChange}
          placeholder="Informe nº do Pedido"
          style={{ marginBottom: 20, width: 250 }}
        />

        {pedidosFiltrados.map((item, index) => {
          return (
            <div key={index} style={{
              borderColor: '#eee',
              padding: 2,
              borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'row', gap: 2, marginBottom: 2
            }}>

              <button onClick={() => BuscaPedido(item?.id)} style={{
                padding: 6,
                display: "flex",
                flexDirection: "column",
                width: 200,
              }} >
                <label>Pedido: {item.id.slice(0, 6).toUpperCase()} - {convertData(item.criadoEm)}</label>
              </button>

              <div style={{ gap: 6, display: 'flex' }}>

                {item.id === pedido.id ? <button onClick={() => window.open(`https://wa.me/${cliente.whatsapp.replace(/\D+/g, '')}`, '_blank')}>
                  <FaWhatsapp size={18} color='#339933' />
                </button> : null}
                {item.id === pedido.id ? <button onClick={() => generatePDF(recuperarConteudoParaPDF, personalizacao)}>
                  <BsFiletypePdf size={18} color='#cc3300' />
                </button> : null}
              </div>
            </div>

          )
        })}
      </div>



      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: "flex-start" }}>

        {/* Area de impressao */}
        {!!pedido?.id ? <div id="conteudo" style={{ display:  'flex' , flexDirection: 'column', width: '100vh' }}>
          {/* Cabeçalho */}
          <div style={{ display: 'flex', alignItems: "center", justifyContent: "center", flexDirection: 'column', marginBottom: 20 }}>
            <img src="/LogoCades.png" style={{ width: 40 }} />
            <div style={{ display: 'flex', alignSelf: 'center', fontSize: '1em', fontWeight: 600 }}>Cades Original</div>
            <div style={{ display: 'flex', alignSelf: 'center', fontWeight: 300, fontSize: 13 }}>Rua Lourival Mesquita, 3328 - Santa Maria da Codipe - Teresina - Piaui</div>
            <div style={{ display: 'flex', alignSelf: 'center', fontWeight: 300, fontSize: 13 }}>CNPJ: 15.302.980/0001-54 - Contato: (86) 99491-8984</div>
          </div>

          <div style={{ display: "flex", alignSelf: "center", fontWeight: 400, padding: 20 }}>Ordem de Compra nº {pedido?.id?.slice(0, 6).toUpperCase()} - {pedido.tipo}</div>

          <div style={{
            borderColor: '#eee',
            borderBottom: '1px solid #eee',
            padding: 10
          }}>

            <div style={{ fontSize: 13, display: 'flex', justifyContent: "space-between" }}>
              <div style={{ display: 'flex', gap: 6, }}>Cliente: <div style={{ fontWeight: 300 }}>{pedido?.cliente?.nome}</div></div>
              <div style={{ display: 'flex', gap: 6, }}>Data Nasc.: <div style={{ fontWeight: 300 }}>{pedido?.cliente?.dataNascimento}</div></div>
              <div style={{ display: 'flex', gap: 6, }}>CPF/CNPJ: <div style={{ fontWeight: 300 }}>{pedido?.cliente?.cpf_cnpj}</div></div>
            </div>
            <div style={{ fontSize: 13, display: 'flex', gap: 6 }}>Contato: <div style={{ fontWeight: 300 }}>{pedido?.cliente?.whatsapp}</div></div>
            <div style={{ fontSize: 13, display: 'flex', gap: 6 }}>Endereço: <div style={{ fontWeight: 300 }}>{pedido?.cliente?.endereco} - {pedido?.cliente?.bairro} - {pedido?.cliente?.cidade} - {pedido?.cliente?.estado} - CEP: {pedido?.cliente?.CEP}</div></div>
          </div>


          <div style={{
            padding: 10, borderColor: '#eee',
            borderBottom: '1px solid #eee',
          }}>

            <div style={{ display: 'flex', alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, fontSize: 13 }}>Qtd.</div>
              <div style={{ flex: 1, fontSize: 13 }}>Ref.</div>
              <div style={{ flex: 7, fontSize: 13 }}>Descrição</div>
              <div style={{ flex: 1, fontSize: 13 }}>Tam.</div>
              <div style={{ flex: 3, fontSize: 13 }}>Cor</div>
              <div style={{ flex: 1, fontSize: 13 }}>Unid.</div>
              <div style={{ flex: 1, textAlign: 'end', fontSize: 13 }}>Total</div>
            </div>

            {pedido?.itemDoPedido?.map((item, index) => {
              return (
                <div key={index} style={{ display: 'flex', alignItems: "center", justifyContent: 'space-between' }}>

                  <div style={{ flex: 1, fontWeight: 300, fontSize: 13 }}>{item.quantidade}</div>
                  <div style={{ flex: 1, fontWeight: 300, fontSize: 13 }}>{item.produto.referencia}</div>
                  <div style={{ flex: 7, fontWeight: 300, fontSize: 13 }}>{item.produto?.nome}</div>
                  <div style={{ flex: 1, fontWeight: 300, fontSize: 13 }}>{item.produto.tamanho}</div>
                  <div style={{ flex: 3, fontWeight: 300, fontSize: 13 }}>{item.produto.cor?.nome}</div>
                  <div style={{ flex: 1, fontWeight: 300, fontSize: 13 }}>{parseFloat(item.valorUnitario).toFixed(2)}</div>
                  <div style={{ flex: 1, textAlign: 'end', fontWeight: 300, fontSize: 13 }}>{parseFloat(item.quantidade * item.valorUnitario).toFixed(2)}</div>
                </div>
              )
            })}
          </div>
          <div style={{ paddingRight: 10, marginTop: 20, flexDirection: 'row', display: "flex", justifyContent: "space-between" }}>

            {/* Observações gerais */}
            <div style={{ paddingLeft: 10, color: '#333' }}>

              <div style={{ fontSize: 10, fontWeight: 500, marginBottom: 6 }}>Atenção</div>
              <div style={{ fontSize: 10, fontWeight: 300 }}>* Não aceitamos cheque</div>
              <div style={{ fontSize: 10, fontWeight: 300 }}>* Confira a nota na entrega, não aceitaremos reclamações posteriores</div>
            </div>

            <div style={{ alignItems: "end", display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 300, display: 'flex', fontSize: 13, textAlign: "end" }}>Valor da Nota:
                <div style={{ width: 80 }}>R$ {parseFloat(pedido.totalDaNota).toFixed(2)}</div>
              </div>

              {!!pedido.desconto ? <div style={{ fontWeight: 300, display: 'flex', fontSize: 13, textAlign: 'end' }}>Desconto de {pedido.desconto}%
                <div style={{ width: 80 }}>-R$ {parseFloat(!!pedido.desconto ? pedido.totalDaNota * (pedido.desconto / 100) : pedido.totalDaNota).toFixed(2)}</div>
              </div> : null}

              {!!pedido.valorAdiantado ? <div style={{ fontWeight: 300, display: 'flex', fontSize: 13, textAlign: 'end' }}>Adiantamento:
                <div style={{ width: 80 }}>R$ {parseFloat(pedido.valorAdiantado).toFixed(2)}</div>
              </div> : null}

              {!!pedido.tempoDePagamento ? <div style={{ fontWeight: 300, display: 'flex', fontSize: 13, textAlign: 'end' }}>Parcelado em {pedido.tempoDePagamento}x
                <div style={{ width: 80 }}>R$ {parseFloat(!!pedido.tempoDePagamento ? (pedido.totalDaNota - pedido?.valorAdiantado) / pedido.tempoDePagamento : pedido.totalDaNota).toFixed(2)}</div>
              </div> : null}

              <div style={{ fontSize: 13, display: 'flex', textAlign: 'end', marginTop:10 }}>Total a pagar:
                <div style={{ width: 80 }}>R$ {parseFloat(!!pedido.desconto || !!pedido.valorAdiantado ? (pedido.totalDaNota - pedido.valorAdiantado) - (pedido.totalDaNota * (pedido.desconto / 100)) : pedido.totalDaNota).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>:null}
      </div>

    </div>
  );
}

export default App;
