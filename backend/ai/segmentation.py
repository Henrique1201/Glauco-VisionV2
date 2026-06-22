import cv2
import numpy as np

def adjust_gamma(image, gamma=1.0):
    inv_gamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv_gamma) * 255 
                      for i in np.arange(0, 256)]).astype("uint8")
    return cv2.LUT(image, table)

def detectar_reflexos(img, gray, threshold_intensity=230, threshold_sat=40, threshold_val=180):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    _, s, v = cv2.split(hsv)
    reflexo_mask = ((gray > threshold_intensity) | 
                    ((s < threshold_sat) & (v > threshold_val)))
    return reflexo_mask

def remover_reflexos(gray, reflexo_mask):
    gray_filtered = gray.copy()
    gray_filtered[reflexo_mask] = 0
    return gray_filtered

def segmentacao_estilo_artigo(img):
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    R = img_rgb[:,:,0]
    R_blur = cv2.GaussianBlur(R, (9,9), 0)

    # Usa OpenCV Threshold
    _, mask_disc = cv2.threshold(
        R_blur, 0, 255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15,15))
    mask_disc = cv2.morphologyEx(mask_disc, cv2.MORPH_CLOSE, kernel)

    cnts, _ = cv2.findContours(mask_disc, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(cnts) == 0:
        return mask_disc

    cnt_disc = max(cnts, key=cv2.contourArea)

    if len(cnt_disc) < 5:
        return mask_disc

    (xc, yc), (W, H), angle = cv2.fitEllipse(cnt_disc)
    mask_final = np.zeros_like(mask_disc)
    cv2.ellipse(mask_final, 
                ((int(xc), int(yc)), (int(W), int(H)), angle),
                255, -1)

    return mask_final

def preencher_buracos(mask):
    mask_preenchida = mask.copy()
    h, w = mask.shape
    ffmask = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(mask_preenchida, ffmask, (0, 0), 255)
    inv = cv2.bitwise_not(mask_preenchida)
    return mask | inv

def aplicar_erosao(mask, erosao_size=10, iterations=1):
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (erosao_size, erosao_size))
    return cv2.erode(mask, kernel, iterations=iterations)

def segmentar_disco_optico(img_path, gamma=1.5, usar_erosao=False, preencher_holes=True):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Imagem não encontrada: {img_path}")
        
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    gray = adjust_gamma(gray, gamma)
    reflexo_mask = detectar_reflexos(img, gray)
    gray_filtered = remover_reflexos(gray, reflexo_mask)
    mask = segmentacao_estilo_artigo(img)

    if preencher_holes:
        mask = preencher_buracos(mask)

    if usar_erosao:
        mask = aplicar_erosao(mask)

    segmentado = cv2.bitwise_and(img_rgb, img_rgb, mask=mask)
    
    # Retorna o BGR segmentado para salvar com OpenCV, ou RGB para exibição
    seg_bgr = cv2.cvtColor(segmentado, cv2.COLOR_RGB2BGR)

    return seg_bgr
