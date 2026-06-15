import type { LessonContent } from '../types';

const neuralNetwork: LessonContent = {
  moduleId: 'neural-network',
  title: 'Semantic Search & Embeddings',
  sections: [
    {
      heading: 'Why embeddings beat keyword search',
      body:
        'Traditional search matches exact tokens. Embeddings map text into dense vectors where semantic similarity corresponds to geometric closeness — "Red Planet" and "Mars" land near each other even without shared words.',
      bullets: [
        'An embedding model converts text → fixed-size float vector (e.g., 384–1536 dims).',
        'Cosine similarity or dot product ranks candidates by meaning, not spelling.',
        'Foundation of retrieval, clustering, recommendation, and RAG pipelines.',
      ],
      tip: 'In interviews, contrast sparse (BM25) vs dense (embedding) retrieval and when hybrid search wins.',
    },
    {
      heading: 'How semantic search works',
      body:
        'At index time, documents are chunked and embedded into a vector store. At query time, the question is embedded with the same model and nearest neighbors are retrieved via approximate nearest-neighbor indexes (HNSW, IVF).',
      code: `score = dot(query_vec, doc_vec) / (||query|| * ||doc||)  // cosine similarity
top_k = argmax_k(scores)`,
    },
    {
      heading: 'Exploring embedding spaces',
      body:
        'Tools like Embedding Atlas let you visualize millions of points with density contours, cross-filtering, and nearest-neighbor search. Clusters reveal topic structure; outliers expose bad chunks or mislabeled data.',
      bullets: [
        'UMAP/t-SNE projections help humans inspect high-dimensional structure.',
        'Cross-filter metadata (source, date, label) to debug retrieval quality.',
        'Real-time neighbor search validates whether similar texts are truly related.',
      ],
    },
    {
      heading: 'Interview talking points',
      body:
        'Expect questions on embedding model choice, chunk size, re-ranking, and evaluation (MRR, nDCG). Mention that embeddings are not magic — stale indexes, domain mismatch, and poor chunking dominate production failures.',
    },
  ],
  keyTakeaways: [
    'Embeddings encode meaning as vectors; similarity search replaces keyword matching for semantic tasks.',
    'Index-time embedding + query-time nearest-neighbor lookup is the core retrieval loop.',
    'Visualizing embedding spaces helps debug clusters, outliers, and retrieval failures.',
  ],
  sourceAttribution: [
    {
      repo: 'apple/embedding-atlas',
      url: 'https://github.com/apple/embedding-atlas',
    },
  ],
  quiz: [
    {
      question: 'Why might "Red Planet" match a document about Mars without shared keywords?',
      options: [
        'BM25 stemmed both terms to the same root',
        'The embedding model places semantically similar phrases close in vector space',
        'The search engine uses alphabetical sorting',
        'Cosine similarity ignores vector direction',
      ],
      correctIndex: 1,
      explanation:
        'Dense embeddings capture semantic relationships; nearby vectors represent related meaning regardless of exact token overlap.',
    },
    {
      question: 'What is computed at query time in a typical semantic search pipeline?',
      options: [
        'Re-embed every document from scratch',
        'Embed the query and rank pre-indexed document vectors by similarity',
        'Tokenize documents with a lexer',
        'Train a new model on the user question',
      ],
      correctIndex: 1,
      explanation:
        'Documents are embedded offline; at query time only the query vector is computed and compared against the index.',
    },
  ],
};

const gradientDescent: LessonContent = {
  moduleId: 'gradient-descent',
  title: 'RAG Pipeline',
  sections: [
    {
      heading: 'What RAG solves',
      body:
        'Large language models hallucinate facts and have knowledge cutoffs. Retrieval-Augmented Generation (RAG) grounds answers in external documents by fetching relevant context before generation.',
      bullets: [
        'Reduces hallucination on domain-specific or private data.',
        'Cheaper than fine-tuning for frequently updated knowledge.',
        'Traceable — answers can cite retrieved chunks.',
      ],
    },
    {
      heading: 'The four-stage pipeline',
      body:
        'A production RAG loop has four phases: chunk documents, embed and index them, retrieve top-k at query time, then pass context + question to the LLM.',
      code: `chunks = split(docs, chunk_size=512, overlap=64)
index.add(embed(chunks))
context = retrieve(embed(query), k=5)
answer = llm.generate(system + context + query)`,
      tip: 'Chunk overlap prevents sentences from being split across boundaries — a common retrieval miss in interviews.',
    },
    {
      heading: 'Retrieval quality levers',
      body:
        'Interviewers probe chunk size, overlap, embedding model choice, metadata filters, hybrid search (BM25 + vectors), and re-rankers. Small chunks improve precision; larger chunks improve context coherence.',
      bullets: [
        'Re-ranking (cross-encoder) after vector retrieval boosts precision@k.',
        'Metadata filters narrow the search space (date, tenant, doc type).',
        'Evaluation: hit rate, MRR, faithfulness, answer relevance.',
      ],
    },
    {
      heading: 'Visualizing retrieval',
      body:
        'Tools like RAGxplorer plot which chunks land near a query in embedding space, making it obvious when retrieval fails — wrong cluster, missing document, or ambiguous phrasing.',
    },
  ],
  keyTakeaways: [
    'RAG = retrieve relevant context, then generate — grounding LLMs in external knowledge.',
    'Chunk → embed → index → retrieve → generate is the canonical pipeline.',
    'Retrieval quality (chunking, hybrid search, re-ranking) dominates RAG success.',
  ],
  sourceAttribution: [
    {
      repo: 'gabrielchua/RAGxplorer',
      url: 'https://github.com/gabrielchua/RAGxplorer',
    },
  ],
  quiz: [
    {
      question: 'What is the primary purpose of the retrieval step in RAG?',
      options: [
        'Fine-tune the LLM weights on new data',
        'Fetch relevant document chunks to inject as context before generation',
        'Compress the LLM to run on CPU',
        'Tokenize the user query for spell-checking',
      ],
      correctIndex: 1,
      explanation:
        'Retrieval selects external evidence the LLM conditions on, reducing hallucination and enabling up-to-date answers.',
    },
    {
      question: 'Why use overlapping chunks when splitting documents?',
      options: [
        'To reduce embedding dimensionality',
        'To prevent important sentences from being cut in half at chunk boundaries',
        'To encrypt stored vectors',
        'To eliminate the need for an index',
      ],
      correctIndex: 1,
      explanation:
        'Overlap ensures context spanning chunk edges is still retrievable as a unit.',
    },
  ],
};

const attention: LessonContent = {
  moduleId: 'attention',
  title: 'Agent Tool Loop',
  sections: [
    {
      heading: 'Agents vs plain LLM calls',
      body:
        'A single LLM API call returns text. An agent wraps the LLM in a loop: assemble context, call the model, parse tool requests, execute them locally, append results, and repeat until the model stops requesting tools.',
      bullets: [
        'The LLM is stateless — the agent owns conversation history.',
        'Tools (Bash, search, APIs) run in the agent process, not inside the model.',
        'Each turn re-sends the full messages[] array to the API.',
      ],
    },
    {
      heading: 'The tool-use message flow',
      body:
        'When the LLM wants to act, it emits a tool_use block with a name and JSON input. The agent executes it, then sends a tool_result back as a user-role message before calling the LLM again.',
      code: `// Turn 1: LLM requests a tool
{ "type": "tool_use", "name": "get_weather",
  "input": { "city": "Istanbul" } }
// Agent executes, then sends:
{ "type": "tool_result", "content": "22°C, clear" }`,
      tip: 'There is no "tool" role in most LLM APIs — results arrive as user messages. Mention this in system-design interviews.',
    },
    {
      heading: 'Context engineering',
      body:
        'Every tool call grows the context window. Agents must manage system prompts, tool schemas, prior turns, and results. Poor context design causes loops, wrong tool choices, and silent failures.',
      bullets: [
        'System prompt defines persona, constraints, and available skills.',
        'tools[] schema tells the LLM what it can call and with what arguments.',
        'History grows linearly — long agent sessions hit latency and cost walls.',
      ],
    },
    {
      heading: 'Failure modes to know',
      body:
        'Common agent bugs: infinite tool loops, wrong tool selection, mishandled errors, and context overflow. Debugging requires tracing each turn — not re-running blindly.',
    },
  ],
  keyTakeaways: [
    'An agent loop: assemble context → LLM → parse tool_use → execute → append result → repeat.',
    'The LLM never runs tools directly; the agent executes and returns tool_result messages.',
    'Context grows with every turn — agent engineering is context engineering.',
  ],
  sourceAttribution: [
    {
      repo: 'ferhatatagun/agent-replay',
      url: 'https://github.com/ferhatatagun/agent-replay',
    },
  ],
  quiz: [
    {
      question: 'Who executes a tool_use block returned by the LLM?',
      options: [
        'The LLM server internally',
        'The agent/runtime code outside the model',
        'The user\'s browser automatically',
        'A separate fine-tuned model',
      ],
      correctIndex: 1,
      explanation:
        'The LLM outputs a tool request as JSON; the agent process parses and executes it locally, then feeds the result back.',
    },
    {
      question: 'Why does the agent re-send the entire messages array on each LLM call?',
      options: [
        'To compress the model weights',
        'Because the LLM API is stateless — prior turns must be included explicitly',
        'To trigger gradient descent',
        'To refresh the embedding index',
      ],
      correctIndex: 1,
      explanation:
        'LLM APIs are stateless; the agent maintains history and sends the full conversation each request.',
    },
  ],
};

const diffusion: LessonContent = {
  moduleId: 'diffusion',
  title: 'Diffusion Models',
  sections: [
    {
      heading: 'From noise to images',
      body:
        'Diffusion models learn to generate data by reversing a gradual noising process. During training, Gaussian noise is added step-by-step until the signal is destroyed; the model learns to predict and remove that noise conditioned on a prompt.',
      bullets: [
        'Forward process: x₀ → x₁ → … → x_T (pure noise).',
        'Reverse process: a neural network denoises x_T back toward x₀.',
        'Text-to-image models condition denoising on an embedding of the prompt.',
      ],
    },
    {
      heading: 'The U-Net backbone',
      body:
        'Most image diffusion models use a U-Net that operates in latent space (smaller than pixel space for efficiency). Skip connections preserve spatial detail while timestep embeddings tell the network how much noise remains.',
      code: `// Simplified denoising step at timestep t
noise_pred = unet(x_t, t, text_embedding)
x_{t-1} = scheduler.step(x_t, noise_pred, t)`,
      tip: 'Latent diffusion (Stable Diffusion) runs the U-Net on a VAE-compressed representation — faster and cheaper than pixel-space diffusion.',
    },
    {
      heading: 'Guidance and sampling',
      body:
        'Classifier-free guidance amplifies the influence of the text prompt by contrasting conditional and unconditional noise predictions. Samplers (DDPM, DDIM, DPM++) trade quality for speed by skipping timesteps.',
      bullets: [
        'Higher guidance → stronger prompt adherence, sometimes oversaturated output.',
        'Fewer steps → faster generation, possible quality loss.',
        'Seed controls randomness — same seed + prompt ≈ reproducible image.',
      ],
    },
    {
      heading: 'Interview talking points',
      body:
        'Contrast diffusion with GANs (adversarial training) and autoregressive image models (pixel-by-pixel). Mention training stability, inference cost (many forward passes), and extensions: ControlNet, inpainting, video diffusion.',
    },
  ],
  keyTakeaways: [
    'Diffusion models generate by iteratively denoising random noise, guided by a text or class condition.',
    'A U-Net predicts noise at each timestep; latent diffusion keeps compute tractable.',
    'Guidance and sampler choice trade prompt fidelity, quality, and inference speed.',
  ],
  sourceAttribution: [
    {
      repo: 'poloclub/diffusion-explainer',
      url: 'https://github.com/poloclub/diffusion-explainer',
    },
  ],
  quiz: [
    {
      question: 'What does the diffusion model predict at each denoising step?',
      options: [
        'The final class label directly',
        'The noise (or score) to remove from the current noisy sample',
        'The next token in a sequence',
        'The gradient of the loss function',
      ],
      correctIndex: 1,
      explanation:
        'The network learns to estimate noise (or the score function) so the scheduler can step toward a clean sample.',
    },
    {
      question: 'Why do latent diffusion models operate in VAE-compressed space?',
      options: [
        'To eliminate the need for a text encoder',
        'To reduce spatial dimensions and make multi-step inference computationally feasible',
        'To avoid using attention layers',
        'To train without GPUs',
      ],
      correctIndex: 1,
      explanation:
        'Compressing images to a lower-dimensional latent space cuts memory and compute per denoising step.',
    },
  ],
};

const agentReplay: LessonContent = {
  moduleId: 'agent-replay',
  title: 'Agent Trace Replay',
  sections: [
    {
      heading: 'Why traces matter',
      body:
        'A finished agent answer hides dozens of intermediate steps — thinking blocks, tool calls, errors, and recoveries. Raw JSON logs are unreadable; a timeline replay makes the loop inspectable.',
      bullets: [
        'One user question can spawn many LLM round-trips.',
        'Tool failures (timeouts, bad args) are where agents break.',
        'Post-hoc debugging beats re-running non-deterministic models.',
      ],
    },
    {
      heading: 'Anatomy of a trace',
      body:
        'Agent traces follow the Anthropic Messages API shape: alternating user/assistant turns with typed content blocks — text, thinking, tool_use, and tool_result.',
      code: `[
  { "role": "user", "content": "Should I go for a run?" },
  { "role": "assistant", "content": [
      { "type": "tool_use", "name": "get_weather", ... }
  ]},
  { "role": "user", "content": [
      { "type": "tool_result", "is_error": true, ... }
  ]}
]`,
    },
    {
      heading: 'What replay reveals',
      body:
        'Step-by-step replay surfaces three failure modes instantly: wrong tool chosen, tool error not handled, and context drift after many turns. Error-flagged tool_result blocks appear distinctly so recovery paths are visible.',
      tip: 'In interviews, describe observability for agents: structured traces, step typing, and failure highlighting — not just final output logging.',
    },
    {
      heading: 'Trace stats and transport',
      body:
        'Useful metrics: message count, tool-call count, unique tools used, error count. Scrubbing a timeline (play/pause/step) beats scrolling JSON when explaining agent behavior to teammates or in design reviews.',
    },
  ],
  keyTakeaways: [
    'Agent answers are loops, not single responses — traces expose every step.',
    'tool_use / tool_result blocks with error flags reveal where agents fail and recover.',
    'Timeline replay is the right primitive for agent debugging and observability design.',
  ],
  sourceAttribution: [
    {
      repo: 'ferhatatagun/agent-replay',
      url: 'https://github.com/ferhatatagun/agent-replay',
    },
  ],
  quiz: [
    {
      question: 'What does a tool_result block with is_error: true indicate?',
      options: [
        'The LLM refused to answer',
        'The agent\'s tool execution failed and returned an error to the model',
        'The user cancelled the request',
        'The embedding index is stale',
      ],
      correctIndex: 1,
      explanation:
        'Error-flagged tool results tell the LLM a tool call failed, allowing it to retry or change strategy.',
    },
    {
      question: 'Why is replaying a trace often better than re-running the agent?',
      options: [
        'Traces are always shorter than JSON',
        'LLM outputs are non-deterministic; replay preserves the exact sequence for debugging',
        'Re-running deletes the vector index',
        'Traces bypass authentication',
      ],
      correctIndex: 1,
      explanation:
        'Re-running may produce different behavior; replay inspects the exact failure path that already occurred.',
    },
  ],
};

const transformer: LessonContent = {
  moduleId: 'transformer',
  title: 'Transformer Architecture',
  sections: [
    {
      heading: 'From recurrence to attention',
      body:
        'Before transformers, sequence models (RNNs, LSTMs) processed tokens one at a time. Transformers replace recurrence with self-attention — every token attends to every other token in parallel, enabling massive scale and long-range dependencies.',
      bullets: [
        'Self-attention computes weighted sums over all positions.',
        'Parallelism across sequence length drives GPU efficiency.',
        'Encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) variants exist.',
      ],
    },
    {
      heading: 'Inside one transformer block',
      body:
        'Each layer stacks multi-head self-attention, residual connections, layer normalization, and a feed-forward network (MLP). Decoder blocks add causal masking so tokens only see prior positions.',
      code: `// Scaled dot-product attention (single head)
scores = Q @ K.T / sqrt(d_k)
weights = softmax(scores)
output = weights @ V`,
      tip: 'Multi-head attention runs h parallel heads with different learned projections, then concatenates — interviewers love the Q/K/V intuition.',
    },
    {
      heading: 'Autoregressive generation',
      body:
        'GPT-style models predict the next token given all prior tokens. Input embeddings + positional encoding feed stacked decoder blocks; a final linear layer outputs vocabulary logits. Sampling (greedy, top-k, temperature) picks the next token.',
      bullets: [
        'Tokenization splits text into subword units (BPE, SentencePiece).',
        'Softmax over vocab produces a probability distribution per step.',
        'Generation repeats until EOS or max length.',
      ],
    },
    {
      heading: 'Interactive exploration',
      body:
        'Running a live GPT-2 forward pass and watching attention weights, residual streams, and probability updates builds intuition no diagram alone provides. Change input text and observe how internal activations shift.',
    },
  ],
  keyTakeaways: [
    'Transformers use self-attention instead of recurrence — parallel and long-range.',
    'Q, K, V projections drive multi-head attention; causal masking enables autoregressive decoding.',
    'Next-token prediction + sampling is how GPT-style models generate text.',
  ],
  sourceAttribution: [
    {
      repo: 'poloclub/transformer-explainer',
      url: 'https://github.com/poloclub/transformer-explainer',
    },
  ],
  quiz: [
    {
      question: 'What does causal masking prevent in a decoder-only transformer?',
      options: [
        'Gradient explosion during training',
        'A token from attending to future tokens during generation',
        'The model from using positional encodings',
        'Multiple attention heads from running in parallel',
      ],
      correctIndex: 1,
      explanation:
        'Causal (look-ahead) masking ensures position i only attends to positions ≤ i, preserving autoregressive validity.',
    },
    {
      question: 'What do Q, K, and V represent in attention?',
      options: [
        'Quantization, Kernel, and Variance buffers',
        'Query, Key, and Value projections used to compute attention weights',
        'Queue, Kill, and Verify scheduler states',
        'Quality, Knowledge, and Validation scores',
      ],
      correctIndex: 1,
      explanation:
        'Queries match against Keys to produce weights; Values are the weighted sum inputs that form the attention output.',
    },
  ],
};

const neuralPlayground: LessonContent = {
  moduleId: 'neural-playground',
  title: 'Neural Network Playground',
  sections: [
    {
      heading: 'Neurons and layers',
      body:
        'A feedforward network maps inputs through weighted sums and activation functions. Hidden layers learn non-linear decision boundaries that a single perceptron cannot represent.',
      bullets: [
        'Each neuron: output = activation(Σ weight × input + bias).',
        'Common activations: ReLU, sigmoid, tanh.',
        'Depth adds representational power; width adds capacity per layer.',
      ],
    },
    {
      heading: 'Decision boundaries in 2D',
      body:
        'On a 2D classification dataset, a 2-layer network can curve its boundary to separate spirals, XOR patterns, and concentric rings. Watching the boundary move during training builds intuition for what networks actually learn.',
      tip: 'If the boundary stays linear, you need more hidden units or layers — a classic interview debugging instinct.',
    },
    {
      heading: 'Training with gradient descent',
      body:
        'The network minimizes a loss (cross-entropy for classification) by backpropagating errors and updating weights with gradient descent. Learning rate controls step size; too high oscillates, too low crawls.',
      code: `for epoch in epochs:
  loss = cross_entropy(predict(X), y)
  grads = backprop(loss)
  weights -= learning_rate * grads`,
    },
    {
      heading: 'Hyperparameters to tune',
      body:
        'Play with learning rate, hidden layer count, neurons per layer, and activation function. Overfitting appears when the boundary wraps noise; underfitting when the boundary is too simple for the data.',
      bullets: [
        'More data usually beats a bigger network on small datasets.',
        'Regularization (L2, dropout) reduces overfitting.',
        'Initialization matters — bad starts can stall training.',
      ],
    },
  ],
  keyTakeaways: [
    'Hidden layers + non-linear activations let networks learn curved decision boundaries.',
    'Gradient descent adjusts weights to minimize loss via backpropagation.',
    'Learning rate, depth, and width trade off convergence speed vs fit quality.',
  ],
  sourceAttribution: [
    {
      repo: 'tensorflow/playground',
      url: 'https://github.com/tensorflow/playground',
    },
  ],
  quiz: [
    {
      question: 'Why can\'t a single-layer perceptron solve XOR?',
      options: [
        'XOR requires more training epochs',
        'XOR is not linearly separable — you need a hidden layer for non-linearity',
        'XOR uses floating-point overflow',
        'Perceptrons cannot compute multiplication',
      ],
      correctIndex: 1,
      explanation:
        'XOR needs a non-linear decision boundary; at least one hidden layer with a non-linear activation is required.',
    },
    {
      question: 'What happens if the learning rate is set too high?',
      options: [
        'Training converges instantly with perfect accuracy',
        'Loss may oscillate or diverge instead of settling at a minimum',
        'The network automatically adds more layers',
        'Backpropagation is skipped',
      ],
      correctIndex: 1,
      explanation:
        'Oversized steps overshoot minima, causing unstable or divergent training.',
    },
  ],
};

const cnnExplainer: LessonContent = {
  moduleId: 'cnn-explainer',
  title: 'CNN Explainer',
  sections: [
    {
      heading: 'Why convolutions for images',
      body:
        'Fully connected layers on raw pixels explode in parameters and ignore spatial structure. Convolutional layers apply small learned filters across the image, sharing weights and detecting local patterns like edges and textures.',
      bullets: [
        'Filters slide (convolve) across height and width.',
        'Parameter sharing drastically reduces model size vs dense layers.',
        'Translation equivariance: a cat edge is detected wherever it appears.',
      ],
    },
    {
      heading: 'Conv → activation → pool',
      body:
        'A typical block: convolution produces feature maps, ReLU adds non-linearity, pooling downsamples spatial resolution. Stacked blocks build a hierarchy from edges to parts to objects.',
      code: `# Output size after conv with padding P, stride S:
# out = floor((in + 2P - kernel) / S) + 1`,
      tip: 'Know output dimension formulas — interviewers ask how 224×224 becomes 7×7 after stacked pools.',
    },
    {
      heading: 'What filters learn',
      body:
        'Early layers detect oriented edges and color blobs; deeper layers combine them into eyes, wheels, and object parts. Visualizing filter activations explains why CNNs generalize on visual tasks.',
      bullets: [
        'Max pooling keeps strongest activations, adds local invariance.',
        'Depth (channels) increases — each layer learns richer features.',
        'Global average pooling + dense head handles classification.',
      ],
    },
    {
      heading: 'Modern context',
      body:
        'Vision Transformers (ViT) patchify images and apply attention, but CNN ideas — local receptive fields, hierarchical features, inductive bias — remain foundational for edge deployment and understanding classic architectures (ResNet, VGG).',
    },
  ],
  keyTakeaways: [
    'Convolutions detect local patterns with shared weights — efficient for spatial data.',
    'Conv → ReLU → pool stacks build hierarchical features from edges to objects.',
    'Filter visualization shows what each layer responds to — key CNN intuition.',
  ],
  sourceAttribution: [
    {
      repo: 'poloclub/cnn-explainer',
      url: 'https://github.com/poloclub/cnn-explainer',
    },
  ],
  quiz: [
    {
      question: 'What is the main advantage of weight sharing in conv layers?',
      options: [
        'It eliminates the need for activation functions',
        'The same filter detects a feature anywhere in the image with far fewer parameters',
        'It guarantees 100% accuracy on MNIST',
        'It replaces the need for pooling',
      ],
      correctIndex: 1,
      explanation:
        'Shared filters scan the entire input, capturing spatial patterns efficiently compared to dense connections.',
    },
    {
      question: 'What does max pooling typically accomplish?',
      options: [
        'Increases spatial resolution',
        'Downsamples feature maps while retaining strong activations',
        'Adds new convolution filters',
        'Computes the loss gradient',
      ],
      correctIndex: 1,
      explanation:
        'Max pooling reduces spatial size and provides local translation invariance by keeping peak responses.',
    },
  ],
};

const ragTrace: LessonContent = {
  moduleId: 'rag-trace',
  title: 'RAG Evidence Trace',
  sections: [
    {
      heading: 'Beyond black-box RAG',
      body:
        'A RAG answer without provenance is hard to trust or debug. Evidence tracing links each claim in the generated answer back to specific retrieved chunks and even span-level citations.',
      bullets: [
        'Users and auditors need to verify sources.',
        'Failed retrieval becomes visible before bad answers ship.',
        'Supports compliance and hallucination detection workflows.',
      ],
    },
    {
      heading: 'The retrieval-to-answer chain',
      body:
        'Trace replay walks through query submission, vector retrieval, chunk ranking, LLM synthesis, and finally evidence mapping — which answer spans cite which source passages.',
      code: `query → embed → top_k chunks → rank by score
→ LLM(context + query) → answer
→ align answer spans ↔ chunk spans (evidence chain)`,
    },
    {
      heading: 'Diagnosing retrieval failures',
      body:
        'When the wrong cluster appears in embedding space or top chunks have low relevance scores, the model may hallucinate despite RAG. Traces expose whether the failure is retrieval (bad chunks) or generation (ignored context).',
      tip: 'Interview frame: separate retrieval metrics (recall@k) from generation metrics (faithfulness, citation accuracy).',
    },
    {
      heading: 'Visualization patterns',
      body:
        'Effective RAG debug UIs show ranked chunks with scores, highlight referenced vs ignored passages, and replay the pipeline step-by-step — the same pattern RAGxplorer uses to make retrieval tangible.',
    },
  ],
  keyTakeaways: [
    'Evidence traces link generated claims to retrieved source chunks.',
    'Separate retrieval failures from generation failures when debugging RAG.',
    'Step-by-step replay makes the query → retrieve → rank → generate pipeline auditable.',
  ],
  sourceAttribution: [
    {
      repo: 'gabrielchua/RAGxplorer',
      url: 'https://github.com/gabrielchua/RAGxplorer',
    },
  ],
  quiz: [
    {
      question: 'An answer cites no chunks but retrieval scores were high. Likely failure mode?',
      options: [
        'Embedding index corruption',
        'Generation ignored provided context (faithfulness failure)',
        'DNS resolution timeout',
        'KV cache overflow',
      ],
      correctIndex: 1,
      explanation:
        'High retrieval scores with uncited or unsupported answers point to the LLM not faithfully using retrieved context.',
    },
    {
      question: 'What does recall@k measure in a RAG system?',
      options: [
        'GPU memory for KV cache',
        'Whether the relevant document appears in the top-k retrieved results',
        'Latency of the TLS handshake',
        'Number of transformer layers',
      ],
      correctIndex: 1,
      explanation:
        'Recall@k checks if ground-truth relevant documents are present in the top-k retrieved set — a retrieval-side metric.',
    },
  ],
};

const graphragHybrid: LessonContent = {
  moduleId: 'graphrag-hybrid',
  title: 'GraphRAG & Hybrid Retrieval',
  sections: [
    {
      heading: 'Why graphs complement vectors',
      body:
        'Vector search finds semantically similar text chunks but misses explicit relationships — "who mentored whom," "who collaborated with whom." Knowledge graphs store typed triples (entity → relationship → entity) that multi-hop traversal can follow.',
      bullets: [
        'Vector retrieval: best for topical overlap and paraphrased questions.',
        'Graph retrieval: best for relationship and lineage questions.',
        'Hybrid: combine both contexts before LLM generation.',
      ],
      tip: 'In interviews, cite Microsoft GraphRAG and Neo4j+Qdrant patterns as production architectures.',
    },
    {
      heading: 'The GraphRAG indexing pipeline',
      body:
        'A typical pipeline extracts entities and relationships from documents (LLM or NER), loads triples into a graph DB (Neo4j), embeds text chunks into a vector store (Qdrant/Pinecone), then queries both at answer time.',
      code: `entities, rels = extract_triples(doc)
neo4j.merge(entities, rels)
qdrant.upsert(embed(chunk(doc)))

# Query time
chunks = qdrant.search(embed(question), k=5)
paths = neo4j.traverse(extract_entities(question), hops=2)
answer = llm(question, chunks + paths)`,
    },
    {
      heading: 'Three retrieval modes',
      body:
        'Comparing modes on the same question reveals trade-offs. Vector-only may find topical paragraphs but miss explicit edges. Graph-only surfaces relationships but may lack narrative detail. Hybrid merges chunk text with relationship chains for richer answers.',
      bullets: [
        'Vector only — "Which scientists worked on nuclear fission?"',
        'Graph only — "How are Marie Curie and Niels Bohr connected?"',
        'Hybrid — complex questions needing both facts and relationships.',
      ],
    },
    {
      heading: 'When hybrid wins',
      body:
        'Hybrid retrieval shines when questions need entity disambiguation plus surrounding context — e.g., influence chains where vector chunks provide historical narrative and graph paths provide typed INFLUENCED_BY edges. Cost: two index lookups and larger LLM context.',
    },
  ],
  keyTakeaways: [
    'Vector search handles semantic similarity; knowledge graphs capture typed relationships.',
    'GraphRAG indexes both triples and embeddings, then queries both at answer time.',
    'Hybrid retrieval combines chunk text with graph paths for relationship-heavy questions.',
  ],
  sourceAttribution: [
    {
      repo: 'charisal/GraphRAG-Demo',
      url: 'https://github.com/charisal/GraphRAG-Demo',
    },
    {
      repo: 'microsoft/graphrag',
      url: 'https://github.com/microsoft/graphrag',
    },
  ],
  quiz: [
    {
      question: 'Which question type is graph retrieval best suited for?',
      options: [
        '"Summarize this paragraph"',
        '"How are two scientists connected through their work?"',
        '"What is the cosine similarity formula?"',
        '"Tokenize this sentence"',
      ],
      correctIndex: 1,
      explanation:
        'Multi-hop graph traversal excels at relationship and connection queries between named entities.',
    },
    {
      question: 'What does hybrid GraphRAG retrieval combine?',
      options: [
        'BM25 and regex search only',
        'Vector-retrieved text chunks and graph-traversed entity relationships',
        'Training data and test data',
        'Encoder and decoder weights',
      ],
      correctIndex: 1,
      explanation:
        'Hybrid mode merges semantic chunks from the vector store with relationship paths from the knowledge graph.',
    },
  ],
};

const kvCache: LessonContent = {
  moduleId: 'kv-cache',
  title: 'LLM Inference & KV Cache',
  sections: [
    {
      heading: 'Prefill vs decode',
      body:
        'LLM inference has two phases. Prefill processes the entire prompt in parallel (high throughput, compute-bound). Decode generates one token at a time autoregressively (memory-bandwidth-bound).',
      bullets: [
        'Time-to-first-token (TTFT) dominated by prefill length.',
        'Inter-token latency dominated by decode steps.',
        'Long prompts increase both compute and KV cache memory.',
      ],
    },
    {
      heading: 'Why KV caching matters',
      body:
        'Each decode step attends to all prior tokens. Without caching, the model recomputes keys and values for the entire prefix every step — O(n²) work across generation. KV cache stores past K/V tensors so only the new token is computed.',
      code: `outputs = model(new_token, past_key_values=cache, use_cache=True)
next_logits = outputs.logits[:, -1, :]
cache = outputs.past_key_values  // append new K/V per layer`,
      tip: 'Interview hook: tie cache size to max context product limits; mention PagedAttention (vLLM) when memory is the bottleneck.',
    },
    {
      heading: 'Sizing the cache',
      body:
        'KV cache memory grows linearly with sequence length, layers, heads, head dimension, batch size, and precision.',
      code: `KV_GB = 2 × B × S × L × H × D × (bytes_per_elem) / 1024³
// 2 = separate K and V tensors per layer`,
      bullets: [
        'B = batch size, S = sequence length, L = layers, H = heads, D = head dim.',
        'FP16 → 2 bytes/elem; INT8 quantization reduces cache footprint.',
        'Long conversations can exceed weight memory in cache alone.',
      ],
    },
    {
      heading: 'Production optimizations',
      body:
        'Serving systems use continuous batching, KV cache paging, speculative decoding, and quantization to balance throughput and latency. Always account for cache when sizing GPUs — weights alone understate memory.',
    },
  ],
  keyTakeaways: [
    'Prefill is parallel prompt processing; decode is sequential token generation.',
    'KV cache stores past K/V tensors so decode avoids recomputing the full prefix.',
    'Cache memory scales linearly with sequence length — often the production bottleneck.',
  ],
  sourceAttribution: [
    {
      repo: 'bentoml/llm-inference-handbook',
      url: 'https://github.com/bentoml/llm-inference-handbook',
    },
  ],
  quiz: [
    {
      question: 'Why does KV caching reduce decode latency?',
      options: [
        'It skips the embedding layer entirely',
        'Past token keys and values are reused instead of recomputed each step',
        'It replaces attention with hash table lookup',
        'It only works for encoder-only models',
      ],
      correctIndex: 1,
      explanation:
        'Cached K/V tensors from prior tokens are appended to; only the new token\'s projections are computed.',
    },
    {
      question: 'Which variable most directly increases KV cache memory?',
      options: [
        'Vocabulary size',
        'Sequence length (context window)',
        'Number of sampling strategies',
        'Tokenizer type',
      ],
      correctIndex: 1,
      explanation:
        'Cache size grows linearly with sequence length — longer contexts store more K/V pairs per layer.',
    },
  ],
};

export const aiMlLessons: Record<string, LessonContent> = {
  'neural-network': neuralNetwork,
  'gradient-descent': gradientDescent,
  attention,
  diffusion,
  'agent-replay': agentReplay,
  transformer,
  'neural-playground': neuralPlayground,
  'cnn-explainer': cnnExplainer,
  'rag-trace': ragTrace,
  'graphrag-hybrid': graphragHybrid,
  'kv-cache': kvCache,
};

export default aiMlLessons;
