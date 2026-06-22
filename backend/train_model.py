"""
Script de treinamento do modelo DenseNet121 para detecção de glaucoma.

Uso:
    python train_model.py --data_dir /caminho/para/dataset_segmentado

O dataset deve ter a seguinte estrutura:
    dataset_segmentado/
    ├── glaucoma/
    │   ├── left_eye/segmentado/   (imagens .jpg/.png)
    │   └── right_eye/segmentado/  (imagens .jpg/.png)
    └── normal/
        ├── left_eye/segmentado/   (imagens .jpg/.png)
        └── right_eye/segmentado/  (imagens .jpg/.png)

O checkpoint será salvo em: backend/ai_models/densenet121_glaucoma.pth
"""

import os
import sys
import argparse

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from tqdm import tqdm


# ── Configurações padrão ────────────────────────────────────────

IMG_SIZE = 224
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.001
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai_models")
OUTPUT_FILENAME = "densenet121_glaucoma.pth"


# ── Dataset ─────────────────────────────────────────────────────

class GlaucomaDataset(Dataset):
    """Dataset de imagens de fundo de olho para detecção de glaucoma."""

    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("RGB")
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label


def load_dataset(base_path, use_masks=False):
    """Carrega paths e labels do dataset de glaucoma."""
    image_paths = []
    labels = []
    folder_name = "masks" if use_masks else "segmentado"

    # Glaucoma (label = 1)
    for eye in ["left_eye", "right_eye"]:
        glaucoma_path = Path(base_path) / "glaucoma" / eye / folder_name
        if glaucoma_path.exists():
            for img_file in glaucoma_path.glob("*"):
                if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".bmp"]:
                    image_paths.append(str(img_file))
                    labels.append(1)

    # Normal (label = 0)
    for eye in ["left_eye", "right_eye"]:
        normal_path = Path(base_path) / "normal" / eye / folder_name
        if normal_path.exists():
            for img_file in normal_path.glob("*"):
                if img_file.suffix.lower() in [".jpg", ".jpeg", ".png", ".bmp"]:
                    image_paths.append(str(img_file))
                    labels.append(0)

    return image_paths, labels


# ── Treinamento ─────────────────────────────────────────────────

def train_model(model, train_loader, val_loader, criterion, optimizer, device, num_epochs):
    """Treina o modelo e retorna o melhor modelo + histórico."""
    best_val_acc = 0.0
    best_model_weights = None

    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch + 1}/{num_epochs}")
        print("-" * 50)

        # ── Fase de treino ──
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in tqdm(train_loader, desc="Training"):
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        train_loss = running_loss / len(train_loader)
        train_acc = 100 * correct / total

        # ── Fase de validação ──
        model.eval()
        running_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for inputs, labels in tqdm(val_loader, desc="Validation"):
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)

                running_loss += loss.item()
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        val_loss = running_loss / len(val_loader)
        val_acc = 100 * correct / total

        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_weights = model.state_dict().copy()
            print(f"  ✅ Novo melhor modelo! Val Acc: {val_acc:.2f}%")

    if best_model_weights:
        model.load_state_dict(best_model_weights)

    return model


def evaluate_model(model, test_loader, device):
    """Avalia o modelo no conjunto de teste e imprime métricas."""
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []

    with torch.no_grad():
        for inputs, labels in tqdm(test_loader, desc="Testing"):
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)
            _, predicted = torch.max(outputs, 1)

            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs[:, 1].cpu().numpy())

    accuracy = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds)
    recall = recall_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds)
    auc = roc_auc_score(all_labels, all_probs)

    print("\n" + "=" * 60)
    print("MÉTRICAS NO CONJUNTO DE TESTE")
    print("=" * 60)
    print(f"  Acurácia:     {accuracy * 100:.2f}%")
    print(f"  Precisão:     {precision * 100:.2f}%")
    print(f"  Recall:       {recall * 100:.2f}%")
    print(f"  F1-Score:     {f1 * 100:.2f}%")
    print(f"  AUC:          {auc:.4f}")
    print("=" * 60)

    return {"accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1, "auc": auc}


# ── Main ────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Treinar DenseNet121 para detecção de glaucoma")
    parser.add_argument(
        "--data_dir",
        type=str,
        default="/mnt/projetos/GlaucoVision/dataset_segmentado",
        help="Caminho para o diretório do dataset segmentado",
    )
    parser.add_argument("--epochs", type=int, default=NUM_EPOCHS, help="Número de epochs")
    parser.add_argument("--batch_size", type=int, default=BATCH_SIZE, help="Tamanho do batch")
    parser.add_argument("--lr", type=float, default=LEARNING_RATE, help="Learning rate")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # ── Carregar dataset ──
    print("\n" + "=" * 60)
    print("CARREGANDO DATASET")
    print("=" * 60)
    image_paths, labels = load_dataset(args.data_dir, use_masks=False)
    print(f"Total de imagens: {len(image_paths)}")
    print(f"Glaucoma: {sum(labels)} | Normal: {len(labels) - sum(labels)}")

    if len(image_paths) == 0:
        print("❌ Nenhuma imagem encontrada! Verifique o caminho do dataset.")
        sys.exit(1)

    # ── Split ──
    X_train, X_temp, y_train, y_temp = train_test_split(
        image_paths, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    # ── Transforms ──
    train_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])

    test_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])

    # ── DataLoaders ──
    train_dataset = GlaucomaDataset(X_train, y_train, transform=train_transform)
    val_dataset = GlaucomaDataset(X_val, y_val, transform=test_transform)
    test_dataset = GlaucomaDataset(X_test, y_test, transform=test_transform)

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False, num_workers=2)

    # ── Modelo ──
    print("\n" + "=" * 60)
    print("CRIANDO MODELO DENSENET121")
    print("=" * 60)
    model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
    model.classifier = nn.Linear(model.classifier.in_features, 2)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)

    # ── Treinar ──
    print("\n" + "=" * 60)
    print("INICIANDO TREINAMENTO")
    print("=" * 60)
    model = train_model(model, train_loader, val_loader, criterion, optimizer, device, args.epochs)

    # ── Avaliar ──
    metrics = evaluate_model(model, test_loader, device)

    # ── Salvar checkpoint ──
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)
    torch.save(model.state_dict(), output_path)
    print(f"\n✅ Modelo salvo em: {output_path}")
    print(f"   Acurácia: {metrics['accuracy'] * 100:.2f}%")
    print(f"   AUC: {metrics['auc']:.4f}")
    print("\n🎉 Treinamento concluído!")
    print(f"   O modelo está pronto para uso no Glauco-VisionV2.")


if __name__ == "__main__":
    main()
