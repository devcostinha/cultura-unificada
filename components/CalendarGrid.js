"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./CalendarGrid.module.css";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarGrid({ mes, eventos, diaSelecionado, onMudarMes, onSelecionarDia }) {
  const inicioMes = startOfMonth(mes);
  const fimMes = endOfMonth(mes);
  const inicioGrid = startOfWeek(inicioMes);
  const fimGrid = endOfWeek(fimMes);
  const dias = eachDayOfInterval({ start: inicioGrid, end: fimGrid });

  function eventosDoDia(dia) {
    return eventos.filter((ev) => isSameDay(new Date(`${ev.data_evento}T00:00:00`), dia));
  }

  return (
    <div>
      <div className={styles.header}>
        <button type="button" className={styles.navBtn} onClick={() => onMudarMes(subMonths(mes, 1))}>
          ‹
        </button>
        <span className={styles.monthLabel}>{format(mes, "MMMM 'de' yyyy", { locale: ptBR })}</span>
        <button type="button" className={styles.navBtn} onClick={() => onMudarMes(addMonths(mes, 1))}>
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} className={styles.weekday}>
            {d}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {dias.map((dia) => {
          const evs = eventosDoDia(dia);
          const visiveis = evs.slice(0, 2);
          const restante = evs.length - visiveis.length;
          const classes = [styles.day];
          if (!isSameMonth(dia, mes)) classes.push(styles.dayOutside);
          if (isToday(dia)) classes.push(styles.dayToday);
          if (diaSelecionado && isSameDay(dia, diaSelecionado)) classes.push(styles.daySelected);

          return (
            <button
              type="button"
              key={dia.toISOString()}
              className={classes.join(" ")}
              onClick={() => onSelecionarDia(dia)}
            >
              <span className={styles.dayNumber}>{format(dia, "d")}</span>
              {visiveis.map((ev) => (
                <span key={ev.id} className={styles.dot}>
                  {ev.titulo}
                </span>
              ))}
              {restante > 0 && <span className={styles.moreLabel}>+{restante} mais</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
