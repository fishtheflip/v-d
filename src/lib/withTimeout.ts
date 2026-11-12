export function withTimeout<T>(request: Promise<T>, ms = 20000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Данные загружаются слишком долго. Проверьте интернет и повторите попытку.')), ms);
    request.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
