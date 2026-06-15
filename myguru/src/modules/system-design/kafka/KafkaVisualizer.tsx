/**
 * Kafka concepts visualizer — topics, partitions, consumer groups, rebalance.
 * Ported from idsulik/kafka-concepts-visualizer (js/main.js)
 * @see https://github.com/idsulik/kafka-concepts-visualizer
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import './kafka.css';

const PARTITION_COUNT = 3;

interface StoredMessage {
  id: string;
  label: string;
}

function assignPartitions(consumerCount: number): number[][] {
  const assignments: number[][] = Array.from({ length: consumerCount }, () => []);
  for (let p = 0; p < PARTITION_COUNT; p++) {
    const consumerIndex = p % consumerCount;
    assignments[consumerIndex].push(p);
  }
  return assignments;
}

export function KafkaVisualizer() {
  const [messageCount, setMessageCount] = useState(0);
  const [consumerCount, setConsumerCount] = useState(1);
  const [partitionMessages, setPartitionMessages] = useState<StoredMessage[][]>(
    () => Array.from({ length: PARTITION_COUNT }, () => []),
  );
  const [consumerMessages, setConsumerMessages] = useState<StoredMessage[][]>([[]]);
  const [rebalancing, setRebalancing] = useState(false);
  const partitionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const consumerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const assignments = useMemo(
    () => assignPartitions(consumerCount),
    [consumerCount],
  );

  const triggerRebalance = useCallback((nextConsumerCount: number) => {
    setRebalancing(true);
    setTimeout(() => setRebalancing(false), 1200);

    setConsumerMessages((prev) => {
      const allMessages = prev.flat();
      const next: StoredMessage[][] = Array.from({ length: nextConsumerCount }, () => []);
      const nextAssignments = assignPartitions(nextConsumerCount);
      allMessages.forEach((msg, i) => {
        const partition = i % PARTITION_COUNT;
        const consumerIndex = nextAssignments.findIndex((parts) => parts.includes(partition));
        if (consumerIndex >= 0) next[consumerIndex].push(msg);
      });
      return next;
    });
  }, []);

  const produceMessage = useCallback(() => {
    const nextCount = messageCount + 1;
    const partition = (nextCount - 1) % PARTITION_COUNT;
    const label = `Msg-${nextCount}`;
    const msg: StoredMessage = { id: `${Date.now()}-${nextCount}`, label };

    setMessageCount(nextCount);
    setPartitionMessages((prev) => {
      const next = prev.map((p) => [...p]);
      next[partition] = [...next[partition], msg];
      return next;
    });

    setTimeout(() => {
      const partitionEl = partitionRefs.current[partition];
      const consumerIndex = partition % consumerCount;
      const consumerEl = consumerRefs.current[consumerIndex];
      if (!partitionEl || !consumerEl) return;

      const moving = document.createElement('span');
      moving.className = 'kafka-viz__message kafka-viz__message--moving';
      moving.textContent = label;
      document.body.appendChild(moving);

      const messageRect = partitionEl.getBoundingClientRect();
      const consumerRect = consumerEl.getBoundingClientRect();
      moving.style.left = `${messageRect.left + 8}px`;
      moving.style.top = `${messageRect.top + 24}px`;

      requestAnimationFrame(() => {
        moving.style.transform = `translate(${consumerRect.left - messageRect.left - 8}px, ${consumerRect.top - messageRect.top - 24}px)`;
      });

      setTimeout(() => {
        moving.remove();
        setConsumerMessages((prev) => {
          const next = prev.map((c) => [...c]);
          next[consumerIndex] = [...next[consumerIndex], msg];
          return next;
        });
      }, 550);
    }, 800);
  }, [consumerCount, messageCount]);

  const addConsumer = useCallback(() => {
    if (consumerCount >= PARTITION_COUNT) return;
    const next = consumerCount + 1;
    setConsumerCount(next);
    triggerRebalance(next);
  }, [consumerCount, triggerRebalance]);

  const removeConsumer = useCallback(() => {
    if (consumerCount <= 1) return;
    const next = consumerCount - 1;
    setConsumerCount(next);
    triggerRebalance(next);
  }, [consumerCount, triggerRebalance]);

  const perConsumer = Math.ceil(PARTITION_COUNT / consumerCount);

  return (
    <div className="kafka-viz">
      <header className="kafka-viz__header">
        <h2>Kafka Concepts</h2>
        <p>Topics, partitions, consumer groups — idsulik/kafka-concepts-visualizer</p>
      </header>

      <div className="kafka-viz__controls">
        <button type="button" className="kafka-viz__btn" onClick={produceMessage}>
          Produce Message
        </button>
        <button
          type="button"
          className="kafka-viz__btn kafka-viz__btn--secondary"
          onClick={addConsumer}
          disabled={consumerCount >= PARTITION_COUNT}
        >
          Add Consumer
        </button>
        <button
          type="button"
          className="kafka-viz__btn kafka-viz__btn--secondary"
          onClick={removeConsumer}
          disabled={consumerCount <= 1}
        >
          Remove Consumer
        </button>
      </div>

      <div className="kafka-viz__system">
        <div className="kafka-viz__topic">
          <h3>Topic: &quot;user-events&quot;</h3>
          {Array.from({ length: PARTITION_COUNT }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                partitionRefs.current[i] = el;
              }}
              className={`kafka-viz__partition${rebalancing ? ' kafka-viz__partition--rebalancing' : ''}`}
            >
              <span className="kafka-viz__partition-label">Partition {i}</span>
              <div className="kafka-viz__messages">
                {partitionMessages[i].map((m) => (
                  <span key={m.id} className="kafka-viz__message">
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="kafka-viz__consumer-group">
          <h3>Consumer Group: &quot;user-events-processor&quot;</h3>
          {Array.from({ length: consumerCount }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                consumerRefs.current[i] = el;
              }}
              className={`kafka-viz__consumer${rebalancing ? ' kafka-viz__consumer--rebalancing' : ''}`}
            >
              <div className="kafka-viz__consumer-header">
                <span>Consumer {i + 1}</span>
                <span className="kafka-viz__assignment">
                  Partitions: {assignments[i].join(', ') || '—'}
                </span>
              </div>
              <div className="kafka-viz__messages">
                {consumerMessages[i]?.map((m) => (
                  <span key={m.id} className="kafka-viz__message">
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kafka-viz__explanation">
        <h3>What&apos;s happening?</h3>
        <p>
          {rebalancing ? (
            <>🔄 Rebalancing — partitions are reassigned across consumers in the group.</>
          ) : (
            <>
              ⚡ {consumerCount} consumer{consumerCount > 1 ? 's' : ''} processing messages from{' '}
              {PARTITION_COUNT} partitions.
              <br />
              👥 Each consumer handles ~{perConsumer} partition{perConsumer > 1 ? 's' : ''}.
              <br />
              🔄 Messages round-robin into partitions, then flow to the assigned consumer.
              <br />
              💡 Each partition is read by exactly one consumer in a group — add consumers to
              rebalance!
            </>
          )}
        </p>
      </div>
    </div>
  );
}
