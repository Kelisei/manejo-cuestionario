var respuestasCorrectas = 0;
var respuestasTotales = 0; // Añadir una variable para el total de respuestas
var preguntas = [];
var preguntaActualIndex = 0;

function actualizarRespuestasCorrectas() {
  respuestasCorrectas += 1;
  // Actualizar el contador de respuestas
  const contador = document.getElementsByClassName("contador")[0];
  contador.innerText = `Respuestas correctas: ${respuestasCorrectas} / ${respuestasTotales}`;
}

class PreguntaQuiz {
  constructor(textoPregunta) {
    this.textoPregunta = textoPregunta;
  }
}

class EleccionMultiple extends PreguntaQuiz {
  constructor(textoPregunta, respuestas, respuestasCorrectas) {
    super(textoPregunta);
    this.respuestas = respuestas;
    this.correctas = this.respuestasCorrectas = respuestasCorrectas; // Array de respuestas correctas
  }

  esCorrecto(respuestasSeleccionadas) {
    // Asegurarse de que respuestasSeleccionadas sea un array
    if (!Array.isArray(respuestasSeleccionadas)) {
      throw new Error("respuestasSeleccionadas debe ser un array");
    }

    // Verificar si cada respuesta correcta está incluida en respuestasSeleccionadas
    const conjuntoCorrecto = new Set(this.respuestasCorrectas);
    const conjuntoSeleccionado = new Set(respuestasSeleccionadas);

    return (
      [...conjuntoCorrecto].every((respuesta) =>
        conjuntoSeleccionado.has(respuesta)
      ) &&
      [...conjuntoSeleccionado].every((respuesta) =>
        conjuntoCorrecto.has(respuesta)
      )
    );
  }

  crearElementoHtml() {
    // Crear un contenedor para la pregunta
    const contenedor = document.createElement("div");
    contenedor.classList.add("carta");

    // Crear y agregar el texto de la pregunta
    const elementoPregunta = document.createElement("h1");
    elementoPregunta.textContent = this.textoPregunta; // Suponiendo que 'textoPregunta' es de la clase padre
    contenedor.appendChild(elementoPregunta);

    // Crear un div para contener las opciones de respuesta
    const contenedorRespuestas = document.createElement("div");
    contenedorRespuestas.classList.add("contenedor-respuestas");
    // Crear y agregar las respuestas
    this.respuestas.forEach((respuesta) => {
      // Crear una etiqueta para cada respuesta
      const etiqueta = document.createElement("label");
      etiqueta.classList.add("opcion-respuesta");

      // Crear un input tipo checkbox para cada respuesta
      const entrada = document.createElement("input");
      entrada.classList.add("cajita-check");
      entrada.type = "checkbox";
      entrada.name = `pregunta_${this.textoPregunta}`; // Nombre único para la pregunta
      entrada.value = respuesta;

      // Agregar el input y el texto de la respuesta a la etiqueta
      etiqueta.appendChild(entrada);
      etiqueta.appendChild(document.createTextNode(respuesta));

      // Agregar la etiqueta al contenedor de respuestas
      contenedorRespuestas.appendChild(etiqueta);
    });

    // Agregar el contenedor de respuestas al contenedor principal
    contenedor.appendChild(contenedorRespuestas);

    // Crear y agregar el botón de confirmar
    const boton = document.createElement("button");
    boton.classList.add("boton");
    boton.textContent = "Confirmar";
    boton.addEventListener("click", () => {
      // Recoger las respuestas seleccionadas
      const respuestasSeleccionadas = Array.from(
        contenedor.querySelectorAll('input[type="checkbox"]:checked')
      ).map((input) => input.value);

      // Verificar si las respuestas seleccionadas son correctas
      if (this.esCorrecto(respuestasSeleccionadas)) {
        actualizarRespuestasCorrectas();
        alert("¡Correcto!");
      } else {
        alert("Incorrecto, las correctas son: " + this.correctas);
      }
      mostrarSiguientePregunta();
    });

    contenedor.appendChild(boton);

    return contenedor;
  }
}

async function cargarPreguntas() {
  try {
    const response = await fetch("preguntasMultipleChoice.json");
    const preguntasJson = await response.json();
    preguntas = preguntasJson.map(
      (pregunta) =>
        new EleccionMultiple(
          pregunta.textoPregunta,
          pregunta.respuestas,
          pregunta.respuestasCorrectas
        )
    );
    // Configurar el total de respuestas
    respuestasTotales = preguntas.length;
    return preguntas;
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
  }
}

function mostrarPregunta(preguntaIndex) {
  const contenedorQuiz = document.getElementById("contenedor-quiz");
  contenedorQuiz.innerHTML = ""; // Limpiar el contenedor
  if (preguntaIndex < preguntas.length) {
    console.log("Mostrando pregunta" + preguntas[preguntaIndex]);
    contenedorQuiz.appendChild(preguntas[preguntaIndex].crearElementoHtml());
  } else {
    // Si no hay más preguntas, mostrar un mensaje final
    const mensajeFinal = document.createElement("p");
    mensajeFinal.textContent = `Has terminado el quiz. Respuestas correctas: ${respuestasCorrectas} / ${respuestasTotales}`;
    contenedorQuiz.appendChild(mensajeFinal);
  }
}

function mostrarSiguientePregunta() {
  preguntaActualIndex += 1;
  mostrarPregunta(preguntaActualIndex);
}

async function iniciarQuiz() {
  const preguntasCargadas = await cargarPreguntas();
  let contador = document.createElement("p");
  contador.classList.add("contador");
  contador.innerText = `Respuestas correctas: ${respuestasCorrectas} / ${respuestasTotales}`;
  document.body.appendChild(contador);

  if (preguntasCargadas.length > 0) {
    mostrarPregunta(preguntaActualIndex);
  }
}

document.getElementById("boton-inicial").addEventListener("click", (event) => {
  document.getElementById("mensaje-inicio").style.display = "none";
  iniciarQuiz();
});
